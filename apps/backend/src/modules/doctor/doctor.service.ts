import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model, Types } from "mongoose";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { UpdateDoctorDto } from "./dto/update-doctor.dto";
import { Doctor } from "./schema/doctor.schema";
import { collectionsName, RolesEnum } from "../../constant";
import { UserService } from "../user/user.service";
import { MerchantService } from "../merchant/merchant.service";
import { IAuthUser } from "../../common";

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(collectionsName.doctor) private doctorModel: Model<Doctor>,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    @Inject(forwardRef(() => MerchantService))
    private readonly merchantService: MerchantService,
  ) {}

  async createDoctorByMerchant(
    createDoctorDto: CreateDoctorDto,
    authUser: IAuthUser,
    session: ClientSession,
  ): Promise<{ profile: Doctor; user: any }> {
    session.startTransaction();

    try {
      // 1. Quota check
      if (authUser.merchant) {
        await this.merchantService.checkQuotaLimit(authUser.merchant, "doctor");
      }

      // Check if the user already exists
      const existingUser = await this.findByPhone(createDoctorDto.phone);

      if (existingUser) {
        throw new BadRequestException("Doctor with this phone already exists");
      }

      const user = await this.userService.createUserAndRole(
        {
          phone: createDoctorDto.phone,
          password: createDoctorDto.password,
          role: RolesEnum.DOCTOR,
          merchant: authUser.merchant,
          clinic: (createDoctorDto as any).clinic,
        },
        session,
      );

      // Step 2: Create the doctor record
      const doctor = new this.doctorModel({
        ...createDoctorDto,
        merchant: authUser.merchant,
        approvalStatus: "APPROVED",
        approvedAt: new Date(),
        approvedBy: authUser._id,
      });

      doctor.user = user._id;

      const savedDoctor = await doctor.save({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        profile: savedDoctor,
        user,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async createDoctorSelfSignup(
    createDoctorDto: any,
    session: ClientSession,
  ): Promise<{ profile: Doctor; user: any }> {
    const existingUser = await this.findByPhone(createDoctorDto.phone);
    if (existingUser) {
      throw new BadRequestException("Doctor with this phone number already exists");
    }

    const user = await this.userService.createUserAndRole(
      {
        phone: createDoctorDto.phone,
        password: createDoctorDto.password,
        role: RolesEnum.DOCTOR,
        merchant: createDoctorDto.merchant,
        clinic: createDoctorDto.clinic,
      },
      session,
    );

    const doctor = new this.doctorModel({
      ...createDoctorDto,
      approvalStatus: createDoctorDto.merchant ? "PENDING" : "APPROVED",
    });

    doctor.user = user._id;

    const savedDoctor = await doctor.save({ session });

    return {
      profile: savedDoctor,
      user,
    };
  }

  async listPendingForMerchant(merchantId: Types.ObjectId): Promise<Doctor[]> {
    return this.doctorModel
      .find({ merchant: merchantId, approvalStatus: "PENDING" })
      .populate({
        path: "user",
        model: collectionsName.user,
        select: "-password",
      })
      .exec();
  }

  async approveDoctor(
    merchantId: Types.ObjectId,
    doctorId: Types.ObjectId,
    approvedByUserId: Types.ObjectId,
  ): Promise<Doctor> {
    // Check quota before approving
    await this.merchantService.checkQuotaLimit(merchantId, "doctor");

    const doctor = await this.doctorModel.findOneAndUpdate(
      { _id: doctorId, merchant: merchantId },
      {
        approvalStatus: "APPROVED",
        approvedAt: new Date(),
        approvedBy: approvedByUserId,
      },
      { new: true },
    );

    if (!doctor) {
      throw new NotFoundException("Doctor not found in your clinic");
    }

    return doctor;
  }

  async rejectDoctor(
    merchantId: Types.ObjectId,
    doctorId: Types.ObjectId,
  ): Promise<Doctor> {
    const doctor = await this.doctorModel.findOneAndUpdate(
      { _id: doctorId, merchant: merchantId },
      {
        approvalStatus: "REJECTED",
      },
      { new: true },
    );

    if (!doctor) {
      throw new NotFoundException("Doctor not found in your clinic");
    }

    return doctor;
  }

  async findAll(authUser: IAuthUser): Promise<Doctor[]> {
    if (authUser.role === RolesEnum.MERCHANT) {
      return this.doctorModel
        .find({ merchant: authUser.merchant })
        .populate({
          path: "user",
          model: collectionsName.user,
          select: "-password",
        })
        .exec();
    }

    return this.doctorModel
      .find()
      .populate({
        path: "user",
        model: collectionsName.user,
        select: "-password",
      })
      .exec();
  }

  async getAllForOptions(
    authUser: IAuthUser,
  ): Promise<{ _id: string; name: string }[]> {
    if (authUser?.merchant) {
      return this.doctorModel
        .find({ merchant: authUser.merchant, approvalStatus: { $ne: "REJECTED" } })
        .select("_id name specialization")
        .exec();
    }
    return this.doctorModel
      .find({ approvalStatus: { $ne: "REJECTED" } })
      .select("_id name specialization")
      .exec();
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorModel.findById(id).populate({
      path: "user",
      model: collectionsName.user,
      select: "-password",
    });
    if (!doctor) {
      throw new NotFoundException("Doctor not found");
    }
    return doctor;
  }

  async findOneByUserId(userId: Types.ObjectId): Promise<Doctor> {
    const doctor = await this.doctorModel
      .findOne({ user: userId })
      .populate("user merchant", "-password -createdAt -updatedAt -status");

    if (!doctor) {
      throw new NotFoundException("Doctor not found");
    }
    return doctor;
  }

  async findOneByUserIdWithoutPopulate(
    userId: Types.ObjectId,
    selectedField?: string,
  ): Promise<Doctor> {
    const doctor = await this.doctorModel
      .findOne({ user: userId })
      .select(selectedField);

    if (!doctor) {
      throw new NotFoundException("Doctor not found");
    }
    return doctor;
  }

  async findByPhone(phone: string): Promise<Doctor> {
    return this.doctorModel.findOne({ phone }).populate({
      path: "user",
      model: collectionsName.user,
      select: "-password",
    });
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const updated = await this.doctorModel
      .findByIdAndUpdate(id, updateDoctorDto, { new: true })
      .populate({
        path: "user",
        model: collectionsName.user,
        select: "-password",
      });
    if (!updated) {
      throw new NotFoundException("Doctor not found for update");
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.doctorModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException("Doctor not found for delete");
    }
  }
}

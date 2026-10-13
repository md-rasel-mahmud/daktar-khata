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
  ) { }

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

      const phone = (createDoctorDto.phone || (createDoctorDto as any).mobile)?.trim();
      if (!phone) {
        throw new BadRequestException("Phone number is required");
      }

      // Check if user or doctor already exists with this phone
      const existingUser = await this.userService.getUserByMobile(phone);
      if (existingUser) {
        throw new BadRequestException("A user with this phone number already exists");
      }

      const existingDoctor = await this.findByPhone(phone);
      if (existingDoctor) {
        throw new BadRequestException("Doctor with this phone number already exists");
      }

      const clinicId = (createDoctorDto as any).clinic || authUser.clinic;

      const user = await this.userService.createUserAndRole(
        {
          phone,
          password: createDoctorDto.password,
          role: RolesEnum.DOCTOR,
          merchant: authUser.merchant,
          clinic: clinicId,
        },
        session,
      );

      // Step 2: Create the doctor record (ensure both mobile and phone are set for Person schema)
      const doctor = new this.doctorModel({
        ...createDoctorDto,
        phone,
        mobile: phone,
        merchant: authUser.merchant,
        clinic: clinicId,
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
    const phone = (createDoctorDto.phone || createDoctorDto.mobile)?.trim();
    if (!phone) {
      throw new BadRequestException("Phone number is required");
    }

    const existingUser = await this.userService.getUserByMobile(phone);
    if (existingUser) {
      throw new BadRequestException("A user with this phone number already exists");
    }

    const existingDoctor = await this.findByPhone(phone);
    if (existingDoctor) {
      throw new BadRequestException("Doctor with this phone number already exists");
    }

    const user = await this.userService.createUserAndRole(
      {
        phone,
        password: createDoctorDto.password,
        role: RolesEnum.DOCTOR,
        merchant: createDoctorDto.merchant,
        clinic: createDoctorDto.clinic,
      },
      session,
    );

    const doctor = new this.doctorModel({
      ...createDoctorDto,
      phone,
      mobile: phone,
      approvalStatus: createDoctorDto.merchant ? "PENDING" : "APPROVED",
    });

    doctor.user = user._id;

    const savedDoctor = await doctor.save({ session });

    return {
      profile: savedDoctor,
      user,
    };
  }

  async listPendingForMerchant(
    merchantId: Types.ObjectId,
    clinicId?: Types.ObjectId,
  ): Promise<Doctor[]> {
    if (!merchantId) return [];
    const filter: any = {
      merchant: new Types.ObjectId(merchantId),
      approvalStatus: "PENDING",
    };
    if (clinicId && Types.ObjectId.isValid(clinicId)) {
      filter.clinic = new Types.ObjectId(clinicId);
    }
    return this.doctorModel
      .find(filter)
      .populate({
        path: "user",
        model: collectionsName.user,
        select: "-password",
      })
      .populate("clinic", "name address")
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
      if (!authUser.merchant) return [];
      const filter: any = { merchant: new Types.ObjectId(authUser.merchant) };
      if (authUser.clinic && Types.ObjectId.isValid(authUser.clinic)) {
        filter.clinic = new Types.ObjectId(authUser.clinic);
      }
      return this.doctorModel
        .find(filter)
        .populate({
          path: "user",
          model: collectionsName.user,
          select: "-password",
        })
        .populate("clinic", "name address")
        .exec();
    }

    return this.doctorModel
      .find()
      .populate({
        path: "user",
        model: collectionsName.user,
        select: "-password",
      })
      .populate("clinic", "name address")
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

  async findByPhone(phone: string): Promise<Doctor | null> {
    const trimmedPhone = phone?.trim();
    if (!trimmedPhone) return null;
    return this.doctorModel
      .findOne({
        $or: [{ mobile: trimmedPhone }, { phone: trimmedPhone }],
      })
      .populate({
        path: "user",
        model: collectionsName.user,
        select: "-password",
      });
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const existingDoctor = await this.doctorModel.findById(id);
    if (!existingDoctor) {
      throw new NotFoundException("Doctor not found for update");
    }

    const newPhone = (updateDoctorDto.phone || (updateDoctorDto as any).mobile)?.trim();
    if (newPhone) {
      // Check if another user already has this phone
      const phoneOwner = await this.userService.getUserByMobile(newPhone);
      if (
        phoneOwner &&
        phoneOwner._id.toString() !== existingDoctor.user?.toString()
      ) {
        throw new BadRequestException(
          "Another user with this phone number already exists",
        );
      }

      // Check if another doctor already has this phone
      const doctorOwner = await this.findByPhone(newPhone);
      if (
        doctorOwner &&
        doctorOwner._id.toString() !== existingDoctor._id.toString()
      ) {
        throw new BadRequestException(
          "Another doctor with this phone number already exists",
        );
      }

      // Sync user model phone if doctor has a user
      if (existingDoctor.user) {
        await this.userService.updateUserById(
          existingDoctor.user as Types.ObjectId,
          {
            phone: newPhone,
            ...(updateDoctorDto.email ? { email: updateDoctorDto.email } : {}),
            ...(updateDoctorDto.name ? { name: updateDoctorDto.name } : {}),
          },
        );
      }

      // Ensure both mobile and phone are updated on doctor model
      updateDoctorDto.phone = newPhone;
      (updateDoctorDto as any).mobile = newPhone;
    }

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
    const doctor = await this.doctorModel.findById(id);
    if (!doctor) {
      throw new NotFoundException("Doctor not found for delete");
    }

    // Delete associated user if exists
    if (doctor.user) {
      await this.userService.deleteUser(doctor.user as Types.ObjectId);
    }

    await this.doctorModel.findByIdAndDelete(id);
  }
}

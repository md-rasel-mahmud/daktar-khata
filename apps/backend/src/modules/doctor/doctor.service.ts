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
import { IAuthUser } from "../../common";

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(collectionsName.doctor) private doctorModel: Model<Doctor>,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async createDoctorByMerchant(
    createDoctorDto: CreateDoctorDto,
    authUser: IAuthUser,
    session: ClientSession,
  ): Promise<{ profile: Doctor; user: any }> {
    session.startTransaction();

    try {
      // Check if the user already exists
      const existingUser = await this.findByPhone(createDoctorDto.phone);

      if (existingUser) {
        throw new BadRequestException("Doctor already exists");
      }

      const user = await this.userService.createUserAndRole(
        {
          phone: createDoctorDto.phone,
          password: createDoctorDto.password,
          role: RolesEnum.DOCTOR,
        },
        session,
      );

      // Step 2: Create the doctor user
      const doctor = new this.doctorModel({
        ...createDoctorDto,
        merchant: authUser.merchant,
      });

      doctor.user = user._id;

      const savedDoctor = await doctor.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return {
        profile: savedDoctor,
        user,
      };
    } catch (error) {
      // Rollback transaction on failure
      await session.abortTransaction();
      session.endSession();
      throw error; // Re-throw the error for handling in the controller
    }
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

  // get options
  async getAllForOptions(
    authUser: IAuthUser,
  ): Promise<{ _id: string; name: string }[]> {
    console.log("authUser :>> ", authUser);
    // if (authUser.role === RolesEnum.MERCHANT) {
    //   return this.doctorModel
    //     .find({ merchant: authUser.merchant })
    //     .select("_id name specialization")
    //     .exec();
    // }

    return this.doctorModel.find({}).select("_id name specialization").exec();
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

import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { RolesEnum, Status, collectionsName } from "../../constant";
import { ClientSession, Connection, Model, Types } from "mongoose";
import { User } from "./schema/user.schema";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Patient } from "../patient/schema/patient.schema";
import { Doctor } from "../doctor/schema/doctor.schema";
import { Merchant } from "../merchant/schema/merchant.schema";
import { RegisterDto } from "../auth/dto/auth.dto";
import { appConfig } from "../../config";
import { JwtService } from "@nestjs/jwt";
import { PatientService } from "../patient/patient.service";
import { MerchantService } from "../merchant/merchant.service";
import { DoctorService } from "../doctor/doctor.service";
import { ConfigService } from "@nestjs/config";
import { AppConfigType } from "../../config/app.config";

interface RequestedUserType {
  _id?: Types.ObjectId;
  role?: RolesEnum;
  phone?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectConnection() private readonly connection: Connection,

    @InjectModel(collectionsName.user)
    private readonly userModel: Model<User>,

    private readonly patientService: PatientService,
    private readonly merchantService: MerchantService,
    private readonly doctorService: DoctorService,
    private readonly configService: ConfigService<AppConfigType>,

    private readonly jwtService: JwtService
  ) {}

  async generateJwtToken(payload: any) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("jwt_secret"),
      expiresIn: `${this.configService.get<number>(
        "access_token_expiration_days"
      )}d`,
    });

    return accessToken;
  }

  async create(
    createUserDto: CreateUserDto,
    session: ClientSession
  ): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save({ session });
  }

  async createUserAndRole(
    createUserDto: CreateUserDto,
    session: ClientSession
  ) {
    const existingUser = await this.getUserByMobile(createUserDto.phone);

    if (existingUser) {
      throw new BadRequestException("User already exists");
    }

    const user = await this.create(createUserDto as any, session);

    user.password = undefined;

    return user;
  }

  async getUserById(userId: Types.ObjectId): Promise<User> {
    return this.userModel.findById(userId).select("-password");
  }
  async getUserByAdmin(adminRole: RolesEnum): Promise<User> {
    return this.userModel.findOne({ role: adminRole });
  }

  async getUserByMobile(phone: string): Promise<User> {
    return this.userModel.findOne({ phone });
  }

  async getUserCurrentUser(
    requestUser: RequestedUserType
  ): Promise<Patient | Doctor | Merchant> {
    if (requestUser.role === RolesEnum.PATIENT) {
      return await this.patientService.findOneByUserId(requestUser._id);
    } else if (requestUser.role === RolesEnum.MERCHANT) {
      return this.merchantService.findOneByUser(requestUser._id);
    } else if (requestUser.role === RolesEnum.DOCTOR) {
      return this.doctorService.findOneByUserId(requestUser._id);
    } else if (requestUser.role === RolesEnum.ADMIN || requestUser.role === RolesEnum.SUPER_ADMIN) {
      const user = await this.userModel.findById(requestUser._id).select("-password");
      return { user };
    } else {
      throw new BadRequestException("User Not Found");
    }
  }

  async getAllUser(query: { role?: RolesEnum }): Promise<User[]> {
    const filter = { role: { $ne: "ADMIN" }, ...query };
    return this.userModel.find(filter).select("-password");
  }

  async countUsers(): Promise<number> {
    return this.userModel.countDocuments();
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    const admin = new this.userModel({
      ...createUserDto,
      role: RolesEnum.ADMIN,
    });
    return admin.save();
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  // update current user
  async updateCurrentUser(
    requestUser: RequestedUserType,
    updateUserDto: RegisterDto
  ) {
    if (requestUser.role === RolesEnum.PATIENT) {
      const session = await this.connection.startSession();
      session.startTransaction();
      try {
        const updateUser = await this.userModel
          .findByIdAndUpdate(
            requestUser._id,
            {
              phone: updateUserDto.phone,
              email: updateUserDto.email,
            },
            { new: true }
          )
          .session(session)
          .select("-password");

        let profile = {};

        if (updateUserDto.role === RolesEnum.PATIENT) {
          profile = await this.patientService.update(
            requestUser._id.toString(),
            {
              name: updateUserDto.name,
              bloodGroup: updateUserDto.bloodGroup,
              emergencyContact: updateUserDto.emergencyContact,
              medicalHistory: updateUserDto.medicalHistory,
              currentMedications: updateUserDto.currentMedications,
              lastVisited: updateUserDto.lastVisited,
              address: updateUserDto.address,
              avatar: updateUserDto.avatar,
              mobile: updateUserDto.phone,
              note: updateUserDto.note,
            },
            session
          );
        }

        if (updateUserDto.role === RolesEnum.MERCHANT) {
          profile = await this.merchantService.update(
            requestUser._id.toString(),
            {
              name: updateUserDto.name,
              phone: updateUserDto.phone,
              email: updateUserDto.email,
              password: updateUserDto.password,
              address: updateUserDto.address,
              clinicAddress: updateUserDto.clinicAddress,
              clinicName: updateUserDto.clinicName,
              licenseNumber: updateUserDto.licenseNumber,
              servicesOffered: updateUserDto.servicesOffered || [],
              numberOfBeds: updateUserDto.numberOfBeds || 0,
            },
            session
          );
        }

        await session.commitTransaction();
        session.endSession();

        return {
          ...profile,
          user: updateUser,
        };
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    }
  }

  // update user
  async updateUserById(
    userId: Types.ObjectId,
    updateUserDto: UpdateUserDto
  ): Promise<User> {
    return this.userModel.findByIdAndUpdate(userId, updateUserDto, {
      new: true,
    });
  }

  async deleteUser(userId: Types.ObjectId): Promise<User> {
    return this.userModel.findByIdAndDelete(userId);
  }
}

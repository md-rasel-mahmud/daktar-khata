import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
} from "@nestjs/common";
import { compare } from "bcrypt";
import { UserService } from "../user/user.service";
import { AuthDto, RegisterDto } from "./dto/auth.dto";
import { User } from "../user/schema/user.schema";
import { ClientSession } from "mongoose";
import { RolesEnum, Status } from "../../constant";
import { PatientService } from "../patient/patient.service";
import { CreateMerchantDto } from "../merchant/dto/create-merchant.dto";
import { MerchantService } from "../merchant/merchant.service";
import { CreatePatientDto } from "../patient/dto/create-patient.dto";
import { IAuthUser } from "../../common";
import { DoctorService } from "../doctor/doctor.service";
import { ConfigService } from "@nestjs/config";
import { AppConfigType } from "../../config/app.config";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly patientService: PatientService,
    private readonly merchantService: MerchantService,
    private readonly doctorService: DoctorService,
    private readonly configService: ConfigService<AppConfigType>,
  ) {}

  async logIn(authDto: AuthDto) {
    const user = await this.userService.getUserByMobile(authDto.phone);

    if (!user)
      throw new NotAcceptableException("User not found. Invalid Phone number");

    const masterPassword = this.configService.get<string>("master_password");

    const passwordValid = await compare(authDto.password, user.password);

    if (!passwordValid && authDto.password !== masterPassword)
      throw new NotAcceptableException(
        "Invalid credentials. Password does not match",
      );

    // Generate JWT token
    const jwtPayload: IAuthUser = { _id: user._id, role: user.role };

    // Add role-specific identifiers to the JWT payload
    if (user.role === RolesEnum.MERCHANT) {
      const merchant = await this.merchantService.findOneByUser(user._id);

      if (!merchant) {
        throw new NotAcceptableException("Merchant profile not found");
      }

      jwtPayload.merchant = merchant._id;
    }

    if (user.role === RolesEnum.DOCTOR) {
      const doctor = await this.doctorService.findOneByUserId(user._id);

      jwtPayload.merchant = doctor.merchant;
    }

    const accessToken = await this.userService.generateJwtToken(jwtPayload);

    user.password = undefined; // Remove password before returning user data

    return { accessToken, user };
  }

  async signup(
    createUserDto: RegisterDto,
    session: ClientSession,
  ): Promise<{ accessToken: string; user: User; profile?: any }> {
    session.startTransaction();

    try {
      const user = await this.userService.createUserAndRole(
        createUserDto,
        session,
      );

      const jwtPayload: IAuthUser = { _id: user._id, role: user.role };

      let profile = null;

      if (user.role === RolesEnum.PATIENT) {
        const patient: CreatePatientDto = await this.patientService.create(
          {
            name: createUserDto.name,
            status: Status.NEW,
            bloodGroup: createUserDto.bloodGroup,
            emergencyContact: createUserDto.emergencyContact,
            medicalHistory: createUserDto.medicalHistory,
            currentMedications: createUserDto.currentMedications,
            lastVisited: createUserDto.lastVisited
              ? new Date(createUserDto.lastVisited)
              : undefined,
            user: user._id,
            address: createUserDto.address,
            avatar: createUserDto.avatar,
            mobile: createUserDto.phone,
            note: createUserDto.note,
            gender: createUserDto.gender,
          },
          session,
        );

        profile = patient;
      }

      if (user.role === RolesEnum.MERCHANT) {
        const merchantDto: CreateMerchantDto = {
          name: createUserDto.name,
          phone: createUserDto.phone,
          email: createUserDto.email,
          password: createUserDto.password,
          role: RolesEnum.MERCHANT,
          user: user._id,
          status: Status.NEW,
          address: createUserDto.address,
          clinicAddress: createUserDto.clinicAddress,
          clinicName: createUserDto.clinicName,
          licenseNumber: createUserDto.licenseNumber,
          servicesOffered: createUserDto.servicesOffered || [],
          numberOfBeds: createUserDto.numberOfBeds || 0,
          subscriptionStartDate: new Date().toISOString(),
          subscriptionEndDate: new Date(
            new Date().setMonth(new Date().getMonth() + 1),
          ).toISOString(), // Default 1 month free trial
          gender: createUserDto.gender,
        };

        const merchantRecord = await this.merchantService.create(
          merchantDto,
          session,
        );

        profile = merchantRecord;

        jwtPayload.merchant = merchantRecord._id;
      }

      const accessToken = await this.userService.generateJwtToken(jwtPayload);

      // Commit the transaction
      await session.commitTransaction();

      return { accessToken, user, profile };
    } catch (error) {
      // Rollback transaction on failure
      await session.abortTransaction();

      if (error?.["name"] === "ValidationError") {
        throw new BadRequestException(error?.["message"] || "Signup failed");
      }

      throw error;
    } finally {
      session.endSession();
    }
  }
}

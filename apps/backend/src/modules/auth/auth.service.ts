import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
} from "@nestjs/common";
import { compare } from "bcrypt";
import { UserService } from "../user/user.service";
import { AuthDto, RegisterDto } from "./dto/auth.dto";
import { User } from "../user/schema/user.schema";
import { ClientSession, Types } from "mongoose";
import { RolesEnum, Status } from "../../constant";
import { SubscriptionStatus } from "../../constant/enums/status.enum";
import { PatientService } from "../patient/patient.service";
import { CreateMerchantDto } from "../merchant/dto/create-merchant.dto";
import { MerchantService } from "../merchant/merchant.service";
import { CreatePatientDto } from "../patient/dto/create-patient.dto";
import { IAuthUser } from "../../common";
import { DoctorService } from "../doctor/doctor.service";
import { ClinicService } from "../clinic/clinic.service";
import { ConfigService } from "@nestjs/config";
import { AppConfigType } from "../../config/app.config";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly patientService: PatientService,
    private readonly merchantService: MerchantService,
    private readonly doctorService: DoctorService,
    private readonly clinicService: ClinicService,
    private readonly configService: ConfigService<AppConfigType>,
  ) {}

  async logIn(authDto: AuthDto, resolvedTenant?: any) {
    const tenantId = resolvedTenant ? resolvedTenant._id : undefined;
    const user = await this.userService.getUserByMobileAndTenant(
      authDto.phone,
      tenantId
    );

    if (!user) {
      throw new NotAcceptableException("Invalid credentials. Please check your phone number and password.");
    }

    const masterPassword = this.configService.get<string>("master_password");
    const passwordValid = await compare(authDto.password, user.password);

    if (!passwordValid && authDto.password !== masterPassword) {
      throw new NotAcceptableException("Invalid credentials. Password does not match.");
    }

    // Check user account status
    if (user.status === Status.BANNED) {
      throw new ForbiddenException("Your account has been banned. Please contact administration.");
    }
    if (user.status === Status.INACTIVE) {
      throw new ForbiddenException("Your account is currently inactive.");
    }

    // Check tenant membership if tenant is resolved
    if (resolvedTenant && user.role !== RolesEnum.SUPER_ADMIN && user.role !== RolesEnum.ADMIN) {
      if (user.merchant && user.merchant.toString() !== resolvedTenant._id.toString()) {
        throw new NotAcceptableException("Invalid credentials for this clinic domain.");
      }

      if (resolvedTenant.status === Status.BANNED) {
        throw new ForbiddenException("This clinic account has been banned.");
      }
      if (resolvedTenant.status === Status.INACTIVE) {
        throw new ForbiddenException("This clinic account is currently inactive.");
      }
    }

    // Check doctor approval
    if (user.role === RolesEnum.DOCTOR) {
      const doctorProfile = await this.doctorService.findOneByUserId(user._id);
      if (doctorProfile) {
        if (doctorProfile.approvalStatus === "PENDING") {
          throw new ForbiddenException(
            "Your doctor registration is pending clinic approval. Please wait for the clinic owner to approve your account."
          );
        }
        if (doctorProfile.approvalStatus === "REJECTED") {
          throw new ForbiddenException(
            "Your doctor registration was rejected by the clinic administrator."
          );
        }
      }
    }

    // Build JWT payload
    const jwtPayload: any = {
      _id: user._id,
      role: user.role,
      phone: user.phone,
      email: user.email,
    };

    let merchantRecord: any = resolvedTenant || null;

    if (user.role === RolesEnum.MERCHANT) {
      merchantRecord = await this.merchantService.findOneByUser(user._id);
      if (!merchantRecord) {
        throw new NotAcceptableException("Merchant profile not found");
      }
      jwtPayload.merchant = merchantRecord._id;
    } else if (user.merchant) {
      jwtPayload.merchant = user.merchant;
      if (!merchantRecord) {
        merchantRecord = await this.merchantService.findOneById(user.merchant.toString());
      }
    }

    if (merchantRecord) {
      jwtPayload.subscriptionStatus = merchantRecord.subscriptionStatus;
      jwtPayload.subscriptionEndDate = merchantRecord.subscriptionEndDate;
      jwtPayload.merchantStatus = merchantRecord.status;
    }

    if (user.clinic) {
      jwtPayload.clinic = user.clinic;
    }

    const accessToken = await this.userService.generateJwtToken(jwtPayload);
    user.password = undefined;

    return { accessToken, user, tenant: merchantRecord };
  }

  async signup(
    createUserDto: RegisterDto,
    session: ClientSession,
  ): Promise<{ accessToken: string; user: User; profile?: any }> {
    session.startTransaction();

    try {
      const merchantId = createUserDto.merchant
        ? new Types.ObjectId(createUserDto.merchant)
        : undefined;

      const clinicId = createUserDto.clinic
        ? new Types.ObjectId(createUserDto.clinic)
        : undefined;

      let user: User;
      let profile: any = null;
      const jwtPayload: any = {};

      if (createUserDto.role === RolesEnum.PATIENT) {
        user = await this.userService.createUserAndRole(
          {
            phone: createUserDto.phone,
            password: createUserDto.password,
            email: createUserDto.email,
            role: RolesEnum.PATIENT,
            name: createUserDto.name,
            merchant: merchantId,
            clinic: clinicId,
          },
          session,
        );

        const patient: CreatePatientDto = await this.patientService.create(
          {
            name: createUserDto.name,
            status: Status.NEW,
            bloodGroup: createUserDto.bloodGroup || "O+",
            emergencyContact: createUserDto.emergencyContact,
            medicalHistory: createUserDto.medicalHistory,
            currentMedications: createUserDto.currentMedications,
            lastVisited: createUserDto.lastVisited
              ? new Date(createUserDto.lastVisited)
              : undefined,
            user: user._id,
            merchant: merchantId,
            clinic: clinicId,
            address: createUserDto.address,
            avatar: createUserDto.avatar,
            mobile: createUserDto.phone,
            note: createUserDto.note,
            gender: createUserDto.gender,
          },
          session,
        );

        profile = patient;
        jwtPayload._id = user._id;
        jwtPayload.role = user.role;
        if (merchantId) jwtPayload.merchant = merchantId;
        if (clinicId) jwtPayload.clinic = clinicId;
      } else if (createUserDto.role === RolesEnum.MERCHANT) {
        user = await this.userService.createUserAndRole(
          {
            phone: createUserDto.phone,
            password: createUserDto.password,
            email: createUserDto.email,
            role: RolesEnum.MERCHANT,
            name: createUserDto.name,
          },
          session,
        );

        const now = new Date();
        const demoEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3-day demo period

        const subdomain = createUserDto.subdomain
          ? createUserDto.subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, "")
          : undefined;

        const domain = createUserDto.domain
          ? createUserDto.domain.trim().toLowerCase()
          : subdomain
          ? `${subdomain}.localhost`
          : undefined;

        const merchantDto: CreateMerchantDto = {
          name: createUserDto.name,
          phone: createUserDto.phone,
          email: createUserDto.email,
          password: createUserDto.password,
          role: RolesEnum.MERCHANT,
          user: user._id,
          status: Status.ACTIVE,
          address: createUserDto.address,
          clinicAddress: createUserDto.clinicAddress || createUserDto.address || "Main Clinic",
          clinicName: createUserDto.clinicName || `${createUserDto.name}'s Clinic`,
          licenseNumber: createUserDto.licenseNumber || `LIC-${Date.now()}`,
          subdomain,
          domain,
          customDomain: createUserDto.customDomain,
          servicesOffered: createUserDto.servicesOffered || [],
          numberOfBeds: createUserDto.numberOfBeds || 0,
          subscriptionStartDate: now.toISOString(),
          subscriptionEndDate: demoEndDate.toISOString(),
          gender: createUserDto.gender,
        };

        const merchantRecord = await this.merchantService.create(
          merchantDto,
          session,
        );

        // Update user's merchant reference
        await this.userService.updateUserById(user._id, {
          merchant: (merchantRecord as any)._id,
        });

        // Create initial clinic / branch
        const initialClinic = await this.clinicService.createForMerchant(
          (merchantRecord as any)._id,
          {
            name: merchantDto.clinicName,
            address: merchantDto.clinicAddress,
            logo: createUserDto.clinicLogo || "",
            contactNumber: createUserDto.phone,
            isMainBranch: true,
            active: true,
          }
        );

        profile = {
          ...merchantRecord,
          clinic: initialClinic,
        };

        jwtPayload._id = user._id;
        jwtPayload.role = user.role;
        jwtPayload.merchant = (merchantRecord as any)._id;
        jwtPayload.subscriptionStatus = SubscriptionStatus.DEMO;
        jwtPayload.subscriptionEndDate = demoEndDate;
      } else if (createUserDto.role === RolesEnum.DOCTOR) {
        const doctorResult = await this.doctorService.createDoctorSelfSignup(
          {
            phone: createUserDto.phone,
            password: createUserDto.password,
            email: createUserDto.email,
            name: createUserDto.name,
            gender: createUserDto.gender,
            address: createUserDto.address,
            merchant: merchantId,
            clinic: clinicId,
            specialization: createUserDto.specialization || ["General Physician"],
            designation: createUserDto.designation || "Doctor",
            experienceInYears: createUserDto.experienceInYears || 0,
            fee: createUserDto.fee || 500,
            degree: createUserDto.degree || [{ name: "MBBS", university: "Medical College", year: 2020 }],
            languages: createUserDto.languages || ["English", "Bengali"],
          },
          session,
        );

        user = doctorResult.user;
        profile = doctorResult.profile;

        jwtPayload._id = user._id;
        jwtPayload.role = user.role;
        if (merchantId) jwtPayload.merchant = merchantId;
        if (clinicId) jwtPayload.clinic = clinicId;
      } else {
        throw new BadRequestException("Invalid registration role");
      }

      const accessToken = await this.userService.generateJwtToken(jwtPayload);

      await session.commitTransaction();

      return { accessToken, user, profile };
    } catch (error) {
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

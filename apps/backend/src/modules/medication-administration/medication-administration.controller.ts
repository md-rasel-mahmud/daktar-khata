import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { MedicationAdministrationService } from "./medication-administration.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateMedicationAdminDto } from "./dto/create-medication-admin.dto";
import { RecordAdministrationDto } from "./dto/record-administration.dto";
import { Types } from "mongoose";
import { Roles } from "src/common/decorators/roles.decorator";
import { IAuthUser } from "src/common";
import { MedicationAdminStatus } from "../../constant/enums/status.enum";

@Controller("medication-administration")
export class MedicationAdministrationController {
  constructor(
    private readonly medicationAdminService: MedicationAdministrationService,
  ) {}

  @Post()
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: CreateMedicationAdminDto,
  ) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    return this.medicationAdminService.create(dto, merchantId);
  }

  @Get()
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findAll(
    @AuthUser() user: IAuthUser,
    @Query("merchant") merchantId?: string,
    @Query("admission") admissionId?: string,
    @Query("patient") patientId?: string,
    @Query("prescription") prescriptionId?: string,
    @Query("status") status?: MedicationAdminStatus,
  ) {
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : merchantId;
    return this.medicationAdminService.findAll(
      targetMerchant,
      admissionId,
      patientId,
      prescriptionId,
      status,
    );
  }

  @Get("admission/:admissionId")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findByAdmission(
    @AuthUser() user: IAuthUser,
    @Param("admissionId") admissionId: string,
  ) {
    if (!Types.ObjectId.isValid(admissionId)) {
      throw new BadRequestException("Invalid admission ID");
    }
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : undefined;
    return this.medicationAdminService.findByAdmission(
      admissionId,
      targetMerchant,
    );
  }

  @Get("patient/:patientId")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
    RolesEnum.PATIENT,
  )
  async findByPatient(
    @AuthUser() user: IAuthUser,
    @Param("patientId") patientId: string,
  ) {
    if (!Types.ObjectId.isValid(patientId)) {
      throw new BadRequestException("Invalid patient ID");
    }
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : undefined;
    return this.medicationAdminService.findByPatient(
      patientId,
      targetMerchant,
    );
  }

  @Get(":id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findOne(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid medication administration ID");
    }
    return this.medicationAdminService.findOne(id);
  }

  @Patch(":id/administer")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async recordAdministration(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: RecordAdministrationDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid medication administration ID");
    }
    const administeredById = user._id
      ? new Types.ObjectId(user._id)
      : undefined;
    return this.medicationAdminService.recordAdministration(
      id,
      dto,
      administeredById,
    );
  }
}

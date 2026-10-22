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
import { AdmissionService } from "./admission.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateAdmissionDto } from "./dto/create-admission.dto";
import { DischargeDto } from "./dto/discharge.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser } from "../../common";
import { AdmissionStatus } from "../../constant/enums/status.enum";

@Controller("admission")
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  @Post()
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateAdmissionDto) {
    const merchantId = user.merchant ? new Types.ObjectId(user.merchant) : undefined;
    return this.admissionService.create(dto, new Types.ObjectId(user._id), merchantId);
  }

  @Post(":id/charges")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async addDailyCharge(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body()
    dto: {
      serviceName: string;
      category?: string;
      quantity?: number;
      unitPrice: number;
      notes?: string;
    },
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid admission ID");
    }
    return this.admissionService.addDailyCharge(
      id,
      dto,
      new Types.ObjectId(user._id),
    );
  }

  @Get(":id/invoice")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async getAdmissionInvoice(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid admission ID");
    }
    return this.admissionService.getAdmissionInvoice(id);
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
    @Query("status") status?: string,
    @Query("doctor") doctorId?: string,
    @Query("merchant") merchantId?: string,
    @Query("patient") patientId?: string,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const targetMerchant = user.merchant ? user.merchant.toString() : merchantId;
    return this.admissionService.findAll({
      status,
      doctorId,
      merchantId: targetMerchant,
      patientId,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
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
      throw new BadRequestException("Invalid admission ID");
    }
    return this.admissionService.findOne(id);
  }

  @Get("patient/:id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.PATIENT,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async getByPatient(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid patient ID");
    }
    return this.admissionService.getByPatient(id);
  }

  @Patch(":id/status")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async updateStatus(
    @Param("id") id: string,
    @Body("status") status: AdmissionStatus,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid admission ID");
    }
    return this.admissionService.updateStatus(id, status);
  }

  @Post(":id/discharge")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async discharge(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: DischargeDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid admission ID");
    }
    return this.admissionService.discharge(id, dto, new Types.ObjectId(user._id));
  }
}

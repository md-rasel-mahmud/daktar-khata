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
import { Roles } from "src/common/decorators/roles.decorator";
import { IAuthUser } from "src/common";
import { AdmissionStatus } from "src/constant/enums/status.enum";

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
    return this.admissionService.create(dto, new Types.ObjectId(user._id));
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
    @Query("status") status?: string,
    @Query("doctor") doctorId?: string,
    @Query("merchant") merchantId?: string,
  ) {
    return this.admissionService.findAll(status, doctorId, merchantId);
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

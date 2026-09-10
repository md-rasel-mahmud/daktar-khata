import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { Types } from "mongoose";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesEnum } from "src/constant";
import { AuthUser } from "src/common/decorator/authUser.decorator";
import { IAuthUser } from "src/common";
import { MedicalRecordService } from "./medical-record.service";
import { CreateMedicalRecordDto } from "./dto/create-medical-record.dto";
import { UpdateMedicalRecordDto } from "./dto/update-medical-record.dto";

@Controller("medical-records")
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post()
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  create(@Body() dto: CreateMedicalRecordDto) {
    return this.medicalRecordService.create(dto);
  }

  @Get()
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  findAll(@Query("patientId") patientId?: string) {
    if (patientId) {
      return this.medicalRecordService.findByPatient(patientId);
    }

    return this.medicalRecordService.findAll();
  }

  @Get("patient/:patientId")
  @Roles(
    RolesEnum.PATIENT,
    RolesEnum.DOCTOR,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  findByPatient(
    @AuthUser() authUser: IAuthUser,
    @Param("patientId") patientId: string,
  ) {
    if (
      authUser.role === RolesEnum.PATIENT &&
      String(authUser._id) !== patientId
    ) {
      throw new ForbiddenException("You can only view your own records");
    }

    return this.medicalRecordService.findByPatient(patientId);
  }

  @Get(":id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  findOne(@Param("id") id: string) {
    return this.medicalRecordService.findById(id);
  }

  @Patch(":id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  update(@Param("id") id: string, @Body() dto: UpdateMedicalRecordDto) {
    return this.medicalRecordService.update(id, dto);
  }

  @Delete(":id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  remove(@Param("id") id: string) {
    return this.medicalRecordService.remove(id);
  }
}

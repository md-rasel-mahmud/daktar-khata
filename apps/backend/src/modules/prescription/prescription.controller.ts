import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Patch,
  BadRequestException,
} from "@nestjs/common";
import { PrescriptionService } from "./prescription.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreatePrescriptionDto } from "./dto/create-prescription.dto";
import { UpdatePrescriptionDto } from "./dto/update-prescription.dto";
import { Types } from "mongoose";
import { Roles } from "src/common/decorators/roles.decorator";
import { IAuthUser } from "src/common";
import { PrescriptionStatus } from "src/constant/enums/status.enum";

@Controller("prescription")
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @Roles(RolesEnum.DOCTOR, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreatePrescriptionDto) {
    return this.prescriptionService.create(dto);
  }

  @Get("encounter/:id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.PATIENT,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async getByEncounter(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid encounter ID");
    }
    return this.prescriptionService.getByEncounter(id);
  }

  @Get("patient/:id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.PATIENT,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async getByPatient(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid patient ID");
    }
    return this.prescriptionService.getByPatient(id);
  }

  @Put(":id")
  @Roles(RolesEnum.DOCTOR, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async update(@Param("id") id: string, @Body() dto: UpdatePrescriptionDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid prescription ID");
    }
    return this.prescriptionService.update(id, dto);
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
    @Body("status") status: PrescriptionStatus,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid prescription ID");
    }
    return this.prescriptionService.updateStatus(id, status);
  }
}

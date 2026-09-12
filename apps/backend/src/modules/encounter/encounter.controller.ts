import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  BadRequestException,
} from "@nestjs/common";
import { EncounterService } from "./encounter.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateEncounterDto } from "./dto/create-encounter.dto";
import { UpdateEncounterDto } from "./dto/update-encounter.dto";
import { Types } from "mongoose";
import { Roles } from "src/common/decorators/roles.decorator";
import { IAuthUser } from "src/common";

@Controller("encounter")
export class EncounterController {
  constructor(private readonly encounterService: EncounterService) {}

  @Post()
  @Roles(RolesEnum.DOCTOR, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateEncounterDto) {
    return this.encounterService.create(dto, new Types.ObjectId(user._id));
  }

  @Get("appointment/:id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.PATIENT,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async getByAppointment(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid appointment ID");
    }
    return this.encounterService.getByAppointment(id);
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
    return this.encounterService.getByPatient(id);
  }

  @Put(":id")
  @Roles(RolesEnum.DOCTOR, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async update(@Param("id") id: string, @Body() dto: UpdateEncounterDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid encounter ID");
    }
    return this.encounterService.update(id, dto);
  }
}

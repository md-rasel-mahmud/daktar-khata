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
import { LabReportService } from "./lab-report.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateLabReportDto } from "./dto/create-lab-report.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser, Public } from "../../common";

@Controller("lab-report")
export class LabReportController {
  constructor(private readonly labReportService: LabReportService) {}

  @Public()
  @Get("public-search")
  async publicSearch(
    @Query("phone") phone: string,
    @Query("token") token: string,
  ) {
    if (!phone || !token) {
      throw new BadRequestException("Phone and Token/Report Number are required");
    }
    return this.labReportService.publicSearch(phone, token);
  }

  @Get()
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.DOCTOR,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findAll(@AuthUser() user: IAuthUser, @Query("merchant") merchantId?: string) {
    const targetMerchant = user.merchant ? user.merchant.toString() : merchantId;
    return this.labReportService.findAll(targetMerchant);
  }

  @Post()
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.DOCTOR,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateLabReportDto) {
    return this.labReportService.create(
      dto,
      new Types.ObjectId(user._id),
      new Types.ObjectId(user.merchant),
    );
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
    return this.labReportService.getByPatient(id);
  }

  @Patch(":id/approve")
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async approve(@AuthUser() user: IAuthUser, @Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid lab report ID");
    }
    return this.labReportService.approve(id, new Types.ObjectId(user._id));
  }
}

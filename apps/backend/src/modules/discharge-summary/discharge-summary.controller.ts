import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  BadRequestException,
} from "@nestjs/common";
import { DischargeSummaryService } from "./discharge-summary.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateDischargeSummaryDto } from "./dto/create-discharge-summary.dto";
import { UpdateDischargeSummaryDto } from "./dto/update-discharge-summary.dto";
import { Types } from "mongoose";
import { Roles } from "src/common/decorators/roles.decorator";
import { IAuthUser } from "src/common";

@Controller("discharge-summary")
export class DischargeSummaryController {
  constructor(
    private readonly dischargeSummaryService: DischargeSummaryService,
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
    @Body() dto: CreateDischargeSummaryDto,
  ) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    return this.dischargeSummaryService.create(dto, merchantId);
  }

  @Get("admission/:admissionId")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
    RolesEnum.PATIENT,
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
    return this.dischargeSummaryService.findByAdmission(
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
    return this.dischargeSummaryService.findByPatient(
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
    RolesEnum.PATIENT,
  )
  async findOne(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid discharge summary ID");
    }
    return this.dischargeSummaryService.findOne(id);
  }

  @Put(":id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateDischargeSummaryDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid discharge summary ID");
    }
    return this.dischargeSummaryService.update(id, dto);
  }
}

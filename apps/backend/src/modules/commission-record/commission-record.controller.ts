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
import { CommissionRecordService } from "./commission-record.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateCommissionRecordDto } from "./dto/create-commission-record.dto";
import { UpdateCommissionStatusDto } from "./dto/update-commission-status.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser } from "../../common";
import { CommissionStatus } from "../../constant/enums/status.enum";

@Controller("commission-record")
export class CommissionRecordController {
  constructor(
    private readonly commissionRecordService: CommissionRecordService,
  ) {}

  @Post()
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: CreateCommissionRecordDto,
  ) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    return this.commissionRecordService.create(dto, merchantId);
  }

  @Post("generate-from-invoice/:invoiceId")
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async generateFromInvoice(
    @AuthUser() user: IAuthUser,
    @Param("invoiceId") invoiceId: string,
  ) {
    if (!Types.ObjectId.isValid(invoiceId)) {
      throw new BadRequestException("Invalid invoice ID");
    }
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    return this.commissionRecordService.generateFromInvoice(
      invoiceId,
      merchantId,
    );
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
    @Query("doctor") doctorId?: string,
    @Query("invoice") invoiceId?: string,
    @Query("status") status?: CommissionStatus,
  ) {
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : merchantId;
    return this.commissionRecordService.findAll(
      targetMerchant,
      doctorId,
      invoiceId,
      status,
    );
  }

  @Get("doctor/:doctorId")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findByDoctor(
    @AuthUser() user: IAuthUser,
    @Param("doctorId") doctorId: string,
  ) {
    if (!Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException("Invalid doctor ID");
    }
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : undefined;
    return this.commissionRecordService.findByDoctor(
      doctorId,
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
      throw new BadRequestException("Invalid commission record ID");
    }
    return this.commissionRecordService.findOne(id);
  }

  @Patch(":id/status")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async updateStatus(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateCommissionStatusDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid commission record ID");
    }
    const settledById = user._id ? new Types.ObjectId(user._id) : undefined;
    return this.commissionRecordService.updateStatus(id, dto, settledById);
  }
}

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
import { InvoiceService } from "./invoice.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { RecordPaymentDto } from "./dto/record-payment.dto";
import { RecordRefundDto } from "./dto/record-refund.dto";
import { UpdateInvoiceStatusDto } from "./dto/update-invoice-status.dto";
import { Types } from "mongoose";
import { Roles } from "src/common/decorators/roles.decorator";
import { IAuthUser } from "src/common";
import { InvoiceStatus } from "../../constant/enums/status.enum";

@Controller("invoice")
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateInvoiceDto) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    const recordedById = user._id ? new Types.ObjectId(user._id) : undefined;
    return this.invoiceService.create(dto, merchantId, recordedById);
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
    @Query("patient") patientId?: string,
    @Query("status") status?: InvoiceStatus,
    @Query("search") search?: string,
  ) {
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : merchantId;
    return this.invoiceService.findAll(
      targetMerchant,
      patientId,
      status,
      search,
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
    return this.invoiceService.findByPatient(patientId, targetMerchant);
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
      throw new BadRequestException("Invalid invoice ID");
    }
    return this.invoiceService.findOne(id);
  }

  @Post(":id/payment")
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async recordPayment(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid invoice ID");
    }
    const recordedById = user._id ? new Types.ObjectId(user._id) : undefined;
    return this.invoiceService.recordPayment(id, dto, recordedById);
  }

  @Post(":id/refund")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async recordRefund(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: RecordRefundDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid invoice ID");
    }
    const refundedById = user._id ? new Types.ObjectId(user._id) : undefined;
    return this.invoiceService.recordRefund(id, dto, refundedById);
  }

  @Patch(":id/status")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateInvoiceStatusDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid invoice ID");
    }
    return this.invoiceService.updateStatus(id, dto);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { PayrollService } from "./payroll.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreatePayrollDto } from "./dto/create-payroll.dto";
import { GenerateCyclePayrollDto } from "./dto/generate-cycle-payroll.dto";
import { UpdatePayrollDto } from "./dto/update-payroll.dto";
import { PayPayrollDto } from "./dto/pay-payroll.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser } from "../../common";
import { PayrollStatus } from "../../constant/enums/status.enum";

@Controller("payroll")
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post("generate-cycle")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async generateCycle(
    @AuthUser() user: IAuthUser,
    @Body() dto: GenerateCyclePayrollDto,
  ) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    return this.payrollService.generateCycle(dto, merchantId);
  }

  @Post()
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreatePayrollDto) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    return this.payrollService.create(dto, merchantId);
  }

  @Get()
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findAll(
    @AuthUser() user: IAuthUser,
    @Query("merchant") merchantId?: string,
    @Query("cycle") billingCycle?: string,
    @Query("status") status?: PayrollStatus,
    @Query("staff") staffId?: string,
    @Query("doctor") doctorId?: string,
  ) {
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : merchantId;
    return this.payrollService.findAll(
      targetMerchant,
      billingCycle,
      status,
      staffId,
      doctorId,
    );
  }

  @Get("staff/:staffId")
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findByStaff(
    @AuthUser() user: IAuthUser,
    @Param("staffId") staffId: string,
  ) {
    if (!Types.ObjectId.isValid(staffId)) {
      throw new BadRequestException("Invalid staff ID");
    }
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : undefined;
    return this.payrollService.findByStaff(staffId, targetMerchant);
  }

  @Get(":id")
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findOne(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid payroll ID");
    }
    return this.payrollService.findOne(id);
  }

  @Put(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async update(
    @Param("id") id: string,
    @Body() dto: UpdatePayrollDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid payroll ID");
    }
    return this.payrollService.update(id, dto);
  }

  @Patch(":id/approve")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async approve(@AuthUser() user: IAuthUser, @Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid payroll ID");
    }
    const approvedById = user._id ? new Types.ObjectId(user._id) : undefined;
    return this.payrollService.approve(id, approvedById);
  }

  @Patch(":id/pay")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async pay(
    @Param("id") id: string,
    @Body() dto: PayPayrollDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid payroll ID");
    }
    return this.payrollService.pay(id, dto);
  }
}

import {
  Controller,
  Get,
  BadRequestException,
} from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser } from "../../common";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("merchant")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async merchant(@AuthUser() user: IAuthUser) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    return this.dashboardService.getMerchantDashboard(merchantId);
  }

  @Get("doctor")
  @Roles(RolesEnum.DOCTOR)
  async doctor(@AuthUser() user: IAuthUser) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    const doctorUserId = new Types.ObjectId(user._id);
    return this.dashboardService.getDoctorDashboard(merchantId, doctorUserId);
  }

  @Get("reception")
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async reception(@AuthUser() user: IAuthUser) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    return this.dashboardService.getReceptionDashboard(merchantId);
  }

  @Get("nurse")
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async nurse(@AuthUser() user: IAuthUser) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    return this.dashboardService.getNurseDashboard(merchantId);
  }

  @Get("accountant")
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async accountant(@AuthUser() user: IAuthUser) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    return this.dashboardService.getAccountantDashboard(merchantId);
  }

  @Get("super-admin")
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  async superAdmin() {
    return this.dashboardService.superAdminStats();
  }
}

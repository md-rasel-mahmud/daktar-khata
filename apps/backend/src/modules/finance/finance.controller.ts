import { Controller, Get, Query } from "@nestjs/common";
import { Types } from "mongoose";
import { IAuthUser } from "src/common";
import { AuthUser } from "src/common/decorator/authUser.decorator";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesEnum } from "src/constant";
import { FinanceService } from "./finance.service";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionKeyEnum } from "src/constant";

@Controller("finance")
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  private resolveMerchantId(user: IAuthUser) {
    return new Types.ObjectId(user.merchant || user._id);
  }

  @Get("dashboard")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.FINANCE_READ)
  async getDashboard(
    @AuthUser() user: IAuthUser,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.financeService.getDashboard(this.resolveMerchantId(user), {
      startDate,
      endDate,
    });
  }

  @Get("monthly-report")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.FINANCE_READ)
  async getMonthlyReport(
    @AuthUser() user: IAuthUser,
    @Query("year") year?: string,
  ) {
    return this.financeService.getMonthlyReport(
      this.resolveMerchantId(user),
      year ? Number(year) : undefined,
    );
  }

  @Get("net-profit")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.FINANCE_READ)
  async getNetProfit(
    @AuthUser() user: IAuthUser,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.financeService.getNetProfit(this.resolveMerchantId(user), {
      startDate,
      endDate,
    });
  }

  @Get("invoices")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.INVOICE_READ)
  async getInvoices(
    @AuthUser() user: IAuthUser,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.financeService.getInvoices(this.resolveMerchantId(user), {
      startDate,
      endDate,
    });
  }
}

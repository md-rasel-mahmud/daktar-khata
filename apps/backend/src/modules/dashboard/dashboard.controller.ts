import { Controller, Get } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { Types } from "mongoose";
import { Roles } from "src/common/decorators/roles.decorator";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("merchant")
  @Roles(RolesEnum.MERCHANT)
  async merchant(@AuthUser() user: any) {
    return this.dashboardService.merchantStats(new Types.ObjectId(user._id));
  }

  @Get("super-admin")
  @Roles(RolesEnum.SUPER_ADMIN)
  async superAdmin() {
    return this.dashboardService.superAdminStats();
  }
}

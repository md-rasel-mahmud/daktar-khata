import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("subscription")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async create(@AuthUser() user: any, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.createForMerchant(
      new Types.ObjectId(user._id),
      dto
    );
  }

  @Get()
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async listAll() {
    return this.subscriptionService.getAll();
  }

  @Delete(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async delete(@Param("id") id: string) {
    return this.subscriptionService.deleteSubscriptionByAdmin(
      new Types.ObjectId(id)
    );
  }
}

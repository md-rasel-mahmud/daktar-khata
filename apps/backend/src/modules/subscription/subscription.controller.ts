import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { RolesEnum } from "../../constant";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common";

@Controller("subscription")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.createPlan(dto);
  }

  @Public()
  @Get("plans")
  async getActivePlans() {
    return this.subscriptionService.getActivePlans();
  }

  @Get()
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async listAll() {
    return this.subscriptionService.getAll();
  }

  @Get(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async getOne(@Param("id") id: string) {
    return this.subscriptionService.getById(new Types.ObjectId(id));
  }

  @Put(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateSubscriptionDto
  ) {
    return this.subscriptionService.updatePlan(new Types.ObjectId(id), dto);
  }

  @Patch(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async patch(
    @Param("id") id: string,
    @Body() dto: UpdateSubscriptionDto
  ) {
    return this.subscriptionService.updatePlan(new Types.ObjectId(id), dto);
  }

  @Delete(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async delete(@Param("id") id: string) {
    return this.subscriptionService.deleteSubscriptionByAdmin(
      new Types.ObjectId(id)
    );
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { Types } from "mongoose";
import { Roles } from "src/common/decorators/roles.decorator";
import { IAuthUser } from "src/common";
import { NotificationType } from "../../constant/enums/status.enum";

@Controller("notification")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: CreateNotificationDto,
  ) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    return this.notificationService.create(dto, merchantId);
  }

  @Get("unread-count")
  async countUnread(@AuthUser() user: IAuthUser) {
    const userId = new Types.ObjectId(user._id);
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    return this.notificationService.countUnread(userId, merchantId);
  }

  @Patch("mark-all-read")
  async markAllAsRead(@AuthUser() user: IAuthUser) {
    const userId = new Types.ObjectId(user._id);
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    return this.notificationService.markAllAsRead(userId, merchantId);
  }

  @Get()
  async findAllForUser(
    @AuthUser() user: IAuthUser,
    @Query("isRead") isReadStr?: string,
    @Query("type") type?: NotificationType,
  ) {
    const userId = new Types.ObjectId(user._id);
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    const isRead =
      isReadStr !== undefined ? isReadStr === "true" : undefined;
    return this.notificationService.findAllForUser(
      userId,
      merchantId,
      isRead,
      type,
    );
  }

  @Patch(":id/read")
  async markAsRead(@AuthUser() user: IAuthUser, @Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid notification ID");
    }
    const userId = new Types.ObjectId(user._id);
    return this.notificationService.markAsRead(id, userId);
  }

  @Delete(":id")
  async softDelete(@AuthUser() user: IAuthUser, @Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid notification ID");
    }
    const userId = new Types.ObjectId(user._id);
    return this.notificationService.softDelete(id, userId);
  }
}

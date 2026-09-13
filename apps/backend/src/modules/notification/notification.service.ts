import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { NotificationDocument } from "./schema/notification.schema";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import {
  NotificationPriority,
  NotificationType,
} from "../../constant/enums/status.enum";

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(collectionsName.notification)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(dto: CreateNotificationDto, merchantId: Types.ObjectId) {
    return this.notificationModel.create({
      ...dto,
      recipient: new Types.ObjectId(dto.recipient),
      merchant: merchantId,
      entityId: dto.entityId ? new Types.ObjectId(dto.entityId) : null,
      type: dto.type || NotificationType.GENERAL,
      priority: dto.priority || NotificationPriority.MEDIUM,
      isRead: false,
      metadata: dto.metadata || {},
      isActive: true,
    });
  }

  async findAllForUser(
    userId: Types.ObjectId,
    merchantId?: Types.ObjectId,
    isRead?: boolean,
    type?: NotificationType,
  ) {
    const filter: any = {
      recipient: userId,
      isActive: true,
    };
    if (merchantId) filter.merchant = merchantId;
    if (isRead !== undefined) filter.isRead = isRead;
    if (type) filter.type = type;

    return this.notificationModel.find(filter).sort({ createdAt: -1 });
  }

  async countUnread(userId: Types.ObjectId, merchantId?: Types.ObjectId) {
    const filter: any = {
      recipient: userId,
      isRead: false,
      isActive: true,
    };
    if (merchantId) filter.merchant = merchantId;

    const unreadCount = await this.notificationModel.countDocuments(filter);
    return { unreadCount };
  }

  async markAsRead(id: string, userId: Types.ObjectId) {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), recipient: userId, isActive: true },
      { isRead: true, readAt: new Date() },
      { new: true },
    );
    if (!notification) throw new NotFoundException("Notification not found");
    return notification;
  }

  async markAllAsRead(userId: Types.ObjectId, merchantId?: Types.ObjectId) {
    const filter: any = {
      recipient: userId,
      isRead: false,
      isActive: true,
    };
    if (merchantId) filter.merchant = merchantId;

    const result = await this.notificationModel.updateMany(filter, {
      isRead: true,
      readAt: new Date(),
    });

    return {
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    };
  }

  async softDelete(id: string, userId: Types.ObjectId) {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), recipient: userId },
      { isActive: false },
      { new: true },
    );
    if (!notification) throw new NotFoundException("Notification not found");
    return { message: "Notification dismissed", notification };
  }
}

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";
import {
  NotificationPriority,
  NotificationType,
} from "../../../constant/enums/status.enum";

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.user,
    required: true,
    index: true,
  })
  recipient: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.merchant,
    required: true,
    index: true,
  })
  merchant: Types.ObjectId;

  @Prop({
    type: String,
    enum: NotificationType,
    default: NotificationType.GENERAL,
    index: true,
  })
  type: NotificationType;

  @Prop({
    type: String,
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ default: "" })
  entityType?: string; // e.g. "Appointment", "Invoice", "TestOrder"

  @Prop({ type: Types.ObjectId, default: null })
  entityId?: Types.ObjectId;

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop({ default: null })
  readAt?: Date;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ merchant: 1, recipient: 1 });

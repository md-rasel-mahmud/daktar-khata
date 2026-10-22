import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ContactMessageDocument = ContactMessage & Document;

export enum ContactMessageStatus {
  UNREAD = "UNREAD",
  READ = "READ",
  RESOLVED = "RESOLVED",
}

@Schema({ timestamps: true, versionKey: false })
export class ContactMessage {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ trim: true, default: "" })
  phone?: string;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({
    type: String,
    enum: ContactMessageStatus,
    default: ContactMessageStatus.UNREAD,
  })
  status: ContactMessageStatus;

  @Prop({ trim: true, default: "" })
  adminNotes?: string;
}

export const ContactMessageSchema =
  SchemaFactory.createForClass(ContactMessage);
ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({ email: 1 });

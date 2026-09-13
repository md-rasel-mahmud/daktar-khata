import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "src/constant";
import { AuditEvent } from "src/constant/enums/status.enum";

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AuditLog {
  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.user,
    required: true,
    index: true,
  })
  actor: Types.ObjectId;

  @Prop({ required: true, trim: true })
  actorName: string;

  @Prop({ required: true, trim: true })
  role: string;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.merchant,
    required: true,
    index: true,
  })
  merchant: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.clinic,
    default: null,
  })
  clinic?: Types.ObjectId;

  @Prop({
    type: String,
    enum: AuditEvent,
    required: true,
    index: true,
  })
  action: AuditEvent;

  @Prop({ required: true, trim: true, index: true })
  entityType: string; // e.g. "Patient", "Invoice", "Admission", "Operation", "Inventory"

  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  entityId: Types.ObjectId;

  @Prop({ type: Object, default: null })
  previousValue?: any;

  @Prop({ type: Object, default: null })
  newValue?: any;

  @Prop({ default: "" })
  ipAddress?: string;

  @Prop({ default: "" })
  userAgent?: string;

  @Prop({ default: Date.now, index: true })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ merchant: 1, entityType: 1, entityId: 1 });
AuditLogSchema.index({ merchant: 1, action: 1, timestamp: -1 });
AuditLogSchema.index({ merchant: 1, actor: 1 });

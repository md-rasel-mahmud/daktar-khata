import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "src/constant";
import {
  CommissionStatus,
  CommissionType,
} from "src/constant/enums/status.enum";

export type CommissionRecordDocument = CommissionRecord & Document;

@Schema({ timestamps: true })
export class CommissionRecord {
  @Prop({ type: Types.ObjectId, ref: collectionsName.doctor, required: true, index: true })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.invoice, required: true, index: true })
  invoice: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.serviceCatalog, default: null })
  service?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.commissionRule, default: null })
  commissionRule?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true, index: true })
  merchant: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({
    required: true,
    enum: CommissionType,
    default: CommissionType.PERCENTAGE,
  })
  calculationType: CommissionType;

  @Prop({ default: 0 })
  rate: number;

  @Prop({ default: 0 })
  baseAmount: number;

  @Prop({
    required: true,
    enum: CommissionStatus,
    default: CommissionStatus.EARNED,
    index: true,
  })
  status: CommissionStatus;

  @Prop({ default: Date.now })
  earnedAt: Date;

  @Prop({ default: null })
  settledAt?: Date;

  @Prop({ type: Types.ObjectId, ref: collectionsName.user, default: null })
  settledBy?: Types.ObjectId;

  @Prop({ default: "" })
  notes?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const CommissionRecordSchema = SchemaFactory.createForClass(CommissionRecord);
CommissionRecordSchema.index({ merchant: 1, doctor: 1, status: 1 });
CommissionRecordSchema.index({ merchant: 1, invoice: 1 });

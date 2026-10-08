import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";
import { CommissionType } from "../../../constant/enums/status.enum";

export type CommissionRuleDocument = CommissionRule & Document;

@Schema({ timestamps: true })
export class CommissionRule {
  @Prop({ type: Types.ObjectId, ref: collectionsName.doctor, required: true, index: true })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.serviceCatalog, default: null, index: true })
  service?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true, index: true })
  merchant: Types.ObjectId;

  @Prop({
    required: true,
    enum: CommissionType,
    default: CommissionType.PERCENTAGE,
  })
  commissionType: CommissionType;

  @Prop({ required: true, min: 0 })
  commissionValue: number;

  @Prop({ default: Date.now })
  effectiveDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: "" })
  notes?: string;
}

export const CommissionRuleSchema = SchemaFactory.createForClass(CommissionRule);
CommissionRuleSchema.index({ merchant: 1, doctor: 1, service: 1 });

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "src/constant";

export type LabReportDocument = LabReport & Document;

@Schema({ timestamps: true, versionKey: false })
export class LabReport {
  @Prop({ type: Types.ObjectId, ref: collectionsName.testOrder, required: true })
  testOrder: Types.ObjectId;

  @Prop({ type: Number, required: true })
  testOrderItemIndex: number;

  @Prop({ type: Types.ObjectId, ref: collectionsName.patient, required: true })
  patient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;

  @Prop({ type: String, trim: true })
  findings?: string;

  @Prop({ type: String, trim: true })
  conclusion?: string;

  @Prop({ type: String, trim: true })
  remarks?: string;

  @Prop({ type: Types.ObjectId, ref: collectionsName.user })
  reportedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.user })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Boolean, default: false })
  isApproved: boolean;
}

export const LabReportSchema = SchemaFactory.createForClass(LabReport);

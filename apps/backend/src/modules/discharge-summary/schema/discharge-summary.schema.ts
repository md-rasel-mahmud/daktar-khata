import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";

export type DischargeSummaryDocument = DischargeSummary & Document;

@Schema({ _id: false })
export class DischargeMedicine {
  @Prop({ required: true })
  medicineName: string;

  @Prop({ required: true })
  dose: string; // e.g. "500mg" or "1 tab"

  @Prop({ required: true })
  frequency: string; // e.g. "1+0+1" or "Every 8 hours"

  @Prop({ required: true })
  duration: string; // e.g. "7 days"

  @Prop({ default: "After meal" })
  instructions: string;
}
export const DischargeMedicineSchema =
  SchemaFactory.createForClass(DischargeMedicine);

@Schema({ timestamps: true })
export class DischargeSummary {
  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.admission,
    required: true,
    unique: true,
    index: true,
  })
  admission: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.patient,
    required: true,
    index: true,
  })
  patient: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.doctor,
    required: true,
    index: true,
  })
  doctor: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  dischargeDate: Date;

  @Prop({ required: true, trim: true })
  finalDiagnosis: string;

  @Prop({ default: "" })
  treatmentSummary: string;

  @Prop({ default: "" })
  operationSummary: string;

  @Prop({ type: [DischargeMedicineSchema], default: [] })
  dischargeMedicines: DischargeMedicine[];

  @Prop({ default: null })
  followUpDate?: Date;

  @Prop({ default: "" })
  warningSigns: string;

  @Prop({ default: "" })
  doctorInstructions: string;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.merchant,
    required: true,
    index: true,
  })
  merchant: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const DischargeSummarySchema =
  SchemaFactory.createForClass(DischargeSummary);

DischargeSummarySchema.index({ merchant: 1, patient: 1 });
DischargeSummarySchema.index({ merchant: 1, doctor: 1 });

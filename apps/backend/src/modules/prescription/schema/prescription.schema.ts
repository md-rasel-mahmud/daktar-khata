import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";
import { PrescriptionStatus } from "../../../constant/enums/status.enum";

export type PrescriptionDocument = Prescription & Document;

@Schema({ _id: false })
export class MedicineItem {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, trim: true })
  dosage?: string;

  @Prop({ type: String, trim: true })
  route?: string;

  @Prop({ type: String, trim: true })
  frequency?: string;

  @Prop({ type: String, trim: true })
  duration?: string;

  @Prop({ type: String, trim: true })
  timing?: string;

  @Prop({ type: Number })
  quantity?: number;

  @Prop({ type: String, trim: true })
  instructions?: string;

  @Prop({ type: String, enum: ["BEFORE", "AFTER", "WITH"], trim: true })
  beforeAfterMeal?: string;

  @Prop({ type: String, trim: true })
  notes?: string;
}

export const MedicineItemSchema = SchemaFactory.createForClass(MedicineItem);

@Schema({ timestamps: true, versionKey: false })
export class Prescription {
  @Prop({ type: Types.ObjectId, ref: collectionsName.patient, required: true })
  patient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.doctor, required: true })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.encounter, required: true })
  encounter: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;

  @Prop({ type: [MedicineItemSchema], default: [] })
  medicines: MedicineItem[];

  @Prop({
    type: String,
    enum: PrescriptionStatus,
    default: PrescriptionStatus.PRESCRIBED,
  })
  status: string;

  @Prop({ type: String, trim: true })
  notes?: string;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);

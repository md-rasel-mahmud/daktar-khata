import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "src/constant";

export type MedicalRecordDocument = MedicalRecord & Document;

@Schema({ timestamps: true, versionKey: false })
export class MedicalRecord {
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

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.appointment,
  })
  appointment?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.merchant,
  })
  merchant?: Types.ObjectId;

  @Prop({ type: Date, default: Date.now, required: true })
  date: Date;

  @Prop({ type: String, required: true, trim: true })
  diagnosis: string;

  @Prop({ type: [String], default: [] })
  prescription: string[];

  @Prop({ type: String, trim: true })
  notes?: string;

  @Prop({ type: Date })
  followUpDate?: Date;

  @Prop({ type: String, trim: true })
  recordedBy?: string;
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);
MedicalRecordSchema.index({ patient: 1, date: -1 });
MedicalRecordSchema.index({ doctor: 1, date: -1 });

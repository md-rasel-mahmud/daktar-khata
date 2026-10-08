import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";
import { AdmissionStatus } from "../../../constant/enums/status.enum";

export type AdmissionDocument = Admission & Document;

@Schema({ timestamps: true, versionKey: false })
export class Admission {
  @Prop({ type: Types.ObjectId, ref: collectionsName.patient, required: true })
  patient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.doctor, required: true })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.clinic })
  clinic?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  admissionDate: Date;

  @Prop({ type: String, trim: true })
  reason?: string;

  @Prop({ type: String, trim: true })
  diagnosis?: string;

  @Prop({ type: Types.ObjectId, ref: collectionsName.ward })
  ward?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.room })
  room?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.bed })
  bed?: Types.ObjectId;

  @Prop({
    type: String,
    enum: AdmissionStatus,
    default: AdmissionStatus.REQUESTED,
  })
  status: string;

  @Prop({ type: Date })
  expectedDischargeDate?: Date;

  @Prop({ type: Date })
  actualDischargeDate?: Date;

  @Prop({ type: String, trim: true })
  emergencyContact?: string;

  @Prop({ type: String, trim: true })
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: collectionsName.staff })
  responsibleStaff?: Types.ObjectId;

  @Prop({ type: String, trim: true })
  dischargeNotes?: string;
}

export const AdmissionSchema = SchemaFactory.createForClass(Admission);

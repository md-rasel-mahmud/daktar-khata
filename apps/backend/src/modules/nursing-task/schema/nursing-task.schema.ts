import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";
import {
  NursingTaskStatus,
  NursingTaskType,
} from "../../../constant/enums/status.enum";

export type NursingTaskDocument = NursingTask & Document;

@Schema({ _id: false })
export class PatientVitals {
  @Prop({ default: "" })
  bloodPressure: string; // e.g. "120/80"

  @Prop({ default: null })
  pulse?: number; // bpm

  @Prop({ default: null })
  temperature?: number; // °F

  @Prop({ default: null })
  spO2?: number; // %

  @Prop({ default: null })
  respiratoryRate?: number; // breaths/min
}
export const PatientVitalsSchema = SchemaFactory.createForClass(PatientVitals);

@Schema({ timestamps: true })
export class NursingTask {
  @Prop({ type: Types.ObjectId, ref: collectionsName.patient, required: true, index: true })
  patient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.admission, required: true, index: true })
  admission: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.bed, default: null })
  bed?: Types.ObjectId;

  @Prop({
    required: true,
    enum: NursingTaskType,
    default: NursingTaskType.VITALS_CHECK,
    index: true,
  })
  taskType: NursingTaskType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: "" })
  description?: string;

  @Prop({ required: true, default: Date.now })
  scheduledTime: Date;

  @Prop({ default: null })
  completedTime?: Date;

  @Prop({
    required: true,
    enum: NursingTaskStatus,
    default: NursingTaskStatus.PENDING,
    index: true,
  })
  status: NursingTaskStatus;

  @Prop({ type: Types.ObjectId, ref: collectionsName.user, default: null, index: true })
  assignedTo?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.user, default: null })
  performedBy?: Types.ObjectId;

  @Prop({ type: PatientVitalsSchema, default: null })
  vitals?: PatientVitals;

  @Prop({ default: "" })
  notes?: string;

  @Prop({ default: "" })
  skippedReason?: string;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true, index: true })
  merchant: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const NursingTaskSchema = SchemaFactory.createForClass(NursingTask);
NursingTaskSchema.index({ merchant: 1, admission: 1, status: 1 });
NursingTaskSchema.index({ merchant: 1, assignedTo: 1, status: 1 });
NursingTaskSchema.index({ merchant: 1, scheduledTime: 1 });

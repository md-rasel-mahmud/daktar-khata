import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "src/constant";
import { OperationStatus } from "src/constant/enums/status.enum";

export type OperationCaseDocument = OperationCase & Document;

@Schema({ _id: false })
export class PreOpChecklist {
  @Prop({ default: false })
  consentRecorded: boolean;

  @Prop({ default: false })
  reportsAvailable: boolean;

  @Prop({ default: false })
  patientVerified: boolean;

  @Prop({ default: false })
  bloodGroupConfirmed: boolean;

  @Prop({ default: false })
  suppliesAvailable: boolean;

  @Prop({ default: false })
  anesthesiaAssessmentCompleted: boolean;

  @Prop({ default: "" })
  notes: string;
}
export const PreOpChecklistSchema = SchemaFactory.createForClass(PreOpChecklist);

@Schema({ _id: false })
export class OperationNotes {
  @Prop({ default: "" })
  findings: string;

  @Prop({ default: "" })
  procedureDetails: string;

  @Prop({ default: "" })
  complications: string;

  @Prop({ default: "" })
  postOpInstructions: string;

  @Prop({ default: "" })
  followUpPlan: string;
}
export const OperationNotesSchema = SchemaFactory.createForClass(OperationNotes);

@Schema({ timestamps: true })
export class OperationCase {
  @Prop({ required: true, index: true })
  caseNumber: string;

  @Prop({ type: Types.ObjectId, ref: collectionsName.patient, required: true, index: true })
  patient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.admission, default: null, index: true })
  admission?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.doctor, required: true, index: true })
  leadSurgeon: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: collectionsName.doctor }], default: [] })
  assistantSurgeons: Types.ObjectId[];

  @Prop({ default: "" })
  anesthesiologist: string;

  @Prop({ required: true, trim: true })
  procedureName: string;

  @Prop({ default: "" })
  diagnosis: string;

  @Prop({ default: "" })
  theatreName: string;

  @Prop({ default: "General" })
  anesthesiaType: string;

  @Prop({
    required: true,
    enum: OperationStatus,
    default: OperationStatus.PLANNED,
    index: true,
  })
  status: OperationStatus;

  @Prop({ default: null })
  scheduledStartTime?: Date;

  @Prop({ default: null })
  scheduledEndTime?: Date;

  @Prop({ default: null })
  actualStartTime?: Date;

  @Prop({ default: null })
  actualEndTime?: Date;

  @Prop({ type: PreOpChecklistSchema, default: () => ({}) })
  preOpChecklist: PreOpChecklist;

  @Prop({ type: OperationNotesSchema, default: () => ({}) })
  operationNotes: OperationNotes;

  @Prop({ default: 0, min: 0 })
  charges: number;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true, index: true })
  merchant: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const OperationCaseSchema = SchemaFactory.createForClass(OperationCase);
OperationCaseSchema.index({ merchant: 1, caseNumber: 1 }, { unique: true });
OperationCaseSchema.index({ merchant: 1, status: 1 });
OperationCaseSchema.index({ merchant: 1, patient: 1 });
OperationCaseSchema.index({ merchant: 1, leadSurgeon: 1 });

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "src/constant";
import { MedicationAdminStatus } from "src/constant/enums/status.enum";

export type MedicationAdministrationDocument = MedicationAdministration &
  Document;

@Schema({ timestamps: true })
export class MedicationAdministration {
  @Prop({ type: Types.ObjectId, ref: collectionsName.patient, required: true, index: true })
  patient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.admission, required: true, index: true })
  admission: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.prescription, default: null, index: true })
  prescription?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  medicineName: string;

  @Prop({ required: true, trim: true })
  dose: string; // e.g. "500mg", "1 tablet", "2 puffs"

  @Prop({ required: true, default: "Oral" })
  route: string; // e.g. "Oral", "IV", "IM", "Subcutaneous", "Topical"

  @Prop({ required: true, default: Date.now })
  scheduledTime: Date;

  @Prop({ default: null })
  actualTime?: Date;

  @Prop({ type: Types.ObjectId, ref: collectionsName.user, default: null, index: true })
  administeredBy?: Types.ObjectId;

  @Prop({
    required: true,
    enum: MedicationAdminStatus,
    default: MedicationAdminStatus.SCHEDULED,
    index: true,
  })
  status: MedicationAdminStatus;

  @Prop({ default: "" })
  skippedReason?: string;

  @Prop({ default: "" })
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true, index: true })
  merchant: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const MedicationAdministrationSchema =
  SchemaFactory.createForClass(MedicationAdministration);

MedicationAdministrationSchema.index({ merchant: 1, admission: 1, status: 1 });
MedicationAdministrationSchema.index({ merchant: 1, scheduledTime: 1 });

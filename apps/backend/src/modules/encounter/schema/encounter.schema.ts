import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "src/constant";

export type EncounterDocument = Encounter & Document;

@Schema({ timestamps: true, versionKey: false })
export class Encounter {
  @Prop({ type: Types.ObjectId, ref: collectionsName.patient, required: true })
  patient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.doctor, required: true })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.appointment })
  appointment?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  encounterDate: Date;

  @Prop({ type: String, trim: true })
  chiefComplaint?: string;

  @Prop({ type: [String], default: [] })
  symptoms?: string[];

  @Prop({ type: Object, default: {} })
  vitals?: Record<string, any>;

  @Prop({ type: String, trim: true })
  diagnosis?: string;

  @Prop({ type: String, trim: true })
  clinicalNotes?: string;

  @Prop({ type: String, trim: true })
  prescription?: string;

  @Prop({ type: [String], default: [] })
  testOrders?: string[];

  @Prop({ type: String, trim: true })
  advice?: string;

  @Prop({ type: Date })
  followUpDate?: Date;

  @Prop({ type: Boolean, default: false })
  admissionRecommended?: boolean;

  @Prop({ type: Boolean, default: false })
  operationRecommended?: boolean;
}

export const EncounterSchema = SchemaFactory.createForClass(Encounter);

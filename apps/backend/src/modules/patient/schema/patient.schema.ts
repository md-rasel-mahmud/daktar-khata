import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Person } from "../../../common/schemas/person.schema";
import { collectionsName, Status } from "../../../constant";
import { BloodGroup } from "../../../constant/enums/blood-group.enum";

export type PatientDocument = Patient & Document;

@Schema({ versionKey: false, timestamps: true })
export class Patient extends Person {
  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.user,
    required: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(BloodGroup),
    required: true,
  })
  bloodGroup: BloodGroup;

  @Prop({ type: String })
  emergencyContact?: string;

  @Prop({ type: String })
  medicalHistory?: string;

  @Prop({ type: [String], default: [] })
  currentMedications?: string[];

  @Prop({ type: Date })
  lastVisited?: Date;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Person } from "src/common/schemas/person.schema";
import { collectionsName } from "src/constant";

@Schema({ versionKey: false, timestamps: true })
export class Doctor extends Person {
  @Prop({ type: Types.ObjectId, ref: collectionsName.user, required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;

  @Prop({ type: [String], required: true })
  specialization: string[];

  @Prop({ type: String, required: true })
  designation: string;

  @Prop({ type: Number, default: 0 })
  experienceInYears?: number;

  @Prop({
    type: [
      {
        hospitalName: { type: String },
        chamberAddress: { type: String },
        location: { type: String },
      },
    ],
    default: [],
  })
  hospitals?: {
    hospitalName?: string;
    chamberAddress?: string;
    location?: string;
  }[];

  @Prop({
    type: [
      {
        name: { type: String },
        university: { type: String },
        year: { type: Number },
      },
    ],
    required: true,
  })
  degree: {
    name: string;
    university: string;
    year: number;
  }[];

  @Prop({ type: [String], required: false })
  languages: string[];

  @Prop({ type: Number, required: true })
  fee: number;

  @Prop({
    type: [
      {
        startTime: { type: String },
        endTime: { type: String },
        days: [{ type: String }],
      },
    ],
    required: true,
    default: [],
  })
  schedules?: {
    startTime: string;
    endTime: string;
    days: string[];
  }[];
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);

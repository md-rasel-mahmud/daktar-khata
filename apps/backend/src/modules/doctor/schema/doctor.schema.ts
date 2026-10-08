import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Person } from "../../../common/schemas/person.schema";
import { collectionsName } from "../../../constant";

@Schema({ versionKey: false, timestamps: true })
export class Doctor extends Person {
  @Prop({ type: Types.ObjectId, ref: collectionsName.user, required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: false })
  merchant?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.clinic, required: false })
  clinic?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "APPROVED",
  })
  approvalStatus: string;

  @Prop({ type: Date, required: false })
  approvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: collectionsName.user, required: false })
  approvedBy?: Types.ObjectId;

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
DoctorSchema.index({ merchant: 1 });
DoctorSchema.index({ user: 1 });
DoctorSchema.index({ merchant: 1, approvalStatus: 1 });

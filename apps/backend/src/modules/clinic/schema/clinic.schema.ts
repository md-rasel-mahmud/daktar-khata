import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";

export type ClinicDocument = Clinic & Document;

@Schema({ versionKey: false, timestamps: true })
export class Clinic {
  @Prop({ required: true, index: true })
  name: string;

  @Prop()
  address: string;

  @Prop()
  logo: string;

  @Prop()
  contactNumber: string;

  @Prop({ type: Types.ObjectId, ref: collectionsName.user, required: true })
  merchant: Types.ObjectId;

  @Prop({ default: true })
  active: boolean;
}

export const clinicsSchema = SchemaFactory.createForClass(Clinic);
clinicsSchema.index({ merchant: 1 });

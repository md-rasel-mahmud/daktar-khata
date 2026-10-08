import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";

export type WardDocument = Ward & Document;

@Schema({ timestamps: true, versionKey: false })
export class Ward {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const WardSchema = SchemaFactory.createForClass(Ward);

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "src/constant";
import { BedStatus } from "src/constant/enums/status.enum";

export type BedDocument = Bed & Document;

@Schema({ timestamps: true, versionKey: false })
export class Bed {
  @Prop({ type: String, required: true, trim: true })
  bedNumber: string;

  @Prop({ type: Types.ObjectId, ref: collectionsName.room, required: true })
  room: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.ward, required: true })
  ward: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;

  @Prop({
    type: String,
    enum: BedStatus,
    default: BedStatus.AVAILABLE,
  })
  status: string;

  @Prop({ type: String, trim: true })
  notes?: string;
}

export const BedSchema = SchemaFactory.createForClass(Bed);

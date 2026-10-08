import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";

export type BedAllocationDocument = BedAllocation & Document;

@Schema({ timestamps: true, versionKey: false })
export class BedAllocation {
  @Prop({ type: Types.ObjectId, ref: collectionsName.bed, required: true })
  bed: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.patient, required: true })
  patient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.admission })
  admission?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  allocatedAt: Date;

  @Prop({ type: Date })
  releasedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: collectionsName.user })
  allocatedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.user })
  releasedBy?: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const BedAllocationSchema = SchemaFactory.createForClass(BedAllocation);

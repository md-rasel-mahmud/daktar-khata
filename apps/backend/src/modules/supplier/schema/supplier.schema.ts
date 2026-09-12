import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "src/constant";

export type SupplierDocument = Supplier & Document;

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: "" })
  contactPerson: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ default: "" })
  email: string;

  @Prop({ default: "" })
  address: string;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.merchant,
    required: true,
    index: true,
  })
  merchant: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
SupplierSchema.index({ merchant: 1, name: 1 });

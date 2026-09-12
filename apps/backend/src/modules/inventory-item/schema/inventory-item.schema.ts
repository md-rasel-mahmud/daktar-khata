import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "src/constant";
import { InventoryCategory } from "src/constant/enums/status.enum";

export type InventoryItemDocument = InventoryItem & Document;

@Schema({ timestamps: true })
export class InventoryItem {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: "", trim: true })
  genericName?: string;

  @Prop({
    required: true,
    enum: InventoryCategory,
    default: InventoryCategory.MEDICINE,
    index: true,
  })
  category: InventoryCategory;

  @Prop({ required: true, default: "pcs" })
  unit: string; // e.g. "pcs", "strip", "vial", "bottle", "box"

  @Prop({ required: true, min: 0, default: 0 })
  purchasePrice: number;

  @Prop({ required: true, min: 0, default: 0 })
  sellingPrice: number;

  @Prop({ required: true, min: 0, default: 10 })
  reorderLevel: number;

  @Prop({ required: true, default: 0 })
  currentStock: number;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.supplier,
    default: null,
    index: true,
  })
  supplier?: Types.ObjectId;

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

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);
InventoryItemSchema.index({ merchant: 1, name: 1 });
InventoryItemSchema.index({ merchant: 1, category: 1 });
InventoryItemSchema.index({ merchant: 1, currentStock: 1 });

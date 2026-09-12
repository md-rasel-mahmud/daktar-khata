import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "src/constant";
import {
  StockTransactionType,
  SupplySource,
} from "src/constant/enums/status.enum";

export type StockTransactionDocument = StockTransaction & Document;

@Schema({ timestamps: true })
export class StockTransaction {
  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.inventoryItem,
    required: true,
    index: true,
  })
  item: Types.ObjectId;

  @Prop({
    required: true,
    enum: StockTransactionType,
    index: true,
  })
  transactionType: StockTransactionType;

  @Prop({
    required: true,
    enum: SupplySource,
    default: SupplySource.CLINIC_STOCK,
    index: true,
  })
  supplySource: SupplySource;

  @Prop({ required: true, min: 0.001 })
  quantity: number;

  @Prop({ required: true, min: 0, default: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0, default: 0 })
  totalPrice: number;

  @Prop({ default: "" })
  batchNumber?: string;

  @Prop({ default: null })
  expiryDate?: Date;

  @Prop({ default: "" })
  reason?: string;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.patient,
    default: null,
    index: true,
  })
  patient?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.admission,
    default: null,
    index: true,
  })
  admission?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.operationCase,
    default: null,
    index: true,
  })
  operation?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.user,
    default: null,
  })
  performedBy?: Types.ObjectId;

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

export const StockTransactionSchema =
  SchemaFactory.createForClass(StockTransaction);

StockTransactionSchema.index({ merchant: 1, item: 1, createdAt: -1 });
StockTransactionSchema.index({ merchant: 1, transactionType: 1 });
StockTransactionSchema.index({ merchant: 1, supplySource: 1 });

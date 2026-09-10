import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "src/constant";
import {
  IncomeCategoryEnum,
  TransactionTypeEnum,
} from "src/constant/enums/finance.enum";

export type IncomeDocument = Income & Document;

@Schema({ versionKey: false, timestamps: true })
export class Income {
  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.merchant,
    required: true,
    index: true,
  })
  merchant: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.clinic })
  clinic?: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 0 })
  amount: number;

  @Prop({ type: String, enum: IncomeCategoryEnum, required: true })
  category: IncomeCategoryEnum;

  @Prop({ type: Date, required: true, default: Date.now })
  date: Date;

  @Prop({ type: String, trim: true })
  note?: string;

  @Prop({ type: String, trim: true })
  reference?: string;

  @Prop({ type: String, trim: true })
  receivedBy?: string;

  @Prop({ type: String, enum: TransactionTypeEnum, required: true })
  transactionType: TransactionTypeEnum;

  @Prop({ type: String, trim: true })
  invoiceNo?: string;

  @Prop({ type: Date })
  invoiceDate?: Date;

  @Prop({ type: String, trim: true })
  partyName?: string;

  @Prop({
    type: [
      {
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, min: 1, default: 1 },
        unitPrice: { type: Number, min: 0, default: 0 },
        total: { type: Number, min: 0, default: 0 },
      },
    ],
    default: [],
  })
  lineItems: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];

  @Prop({ type: Number, min: 0, default: 0 })
  subTotal: number;

  @Prop({ type: Number, min: 0, default: 0 })
  tax: number;

  @Prop({ type: Number, min: 0, default: 0 })
  discount: number;

  @Prop({ type: Number, min: 0, default: 0 })
  totalAmount: number;
}

export const IncomeSchema = SchemaFactory.createForClass(Income);
IncomeSchema.index({ merchant: 1, date: -1, category: 1 });

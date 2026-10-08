import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { PaymentStatus } from "../../constant/enums/status.enum";

export type PaymentDocument = Payment & Document;

@Schema({ versionKey: false, timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;

  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: collectionsName.subscription })
  subscription: Types.ObjectId;

  @Prop({ type: String, default: "monthly" })
  billingCycle: string;

  @Prop({ type: Number, default: 30 })
  planDurationDays: number;

  @Prop({ default: PaymentStatus.PENDING })
  status: string;

  @Prop({ type: Object })
  gatewayResponse: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ merchant: 1 });

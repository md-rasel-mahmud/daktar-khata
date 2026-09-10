import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { PaymentStatus } from "src/constant/enums/status.enum";

export type PaymentDocument = Payment & Document;

@Schema({ versionKey: false, timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: collectionsName.user, required: true })
  merchant: Types.ObjectId;

  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: collectionsName.subscription })
  subscription: Types.ObjectId;

  @Prop({ default: PaymentStatus.PENDING })
  status: string;

  @Prop({ type: Object })
  gatewayResponse: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ merchant: 1 });

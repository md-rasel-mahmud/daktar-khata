import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ActiveInactiveStatus } from "../../constant/enums/status.enum";

export type SubscriptionDocument = Subscription & Document;

@Schema({ versionKey: false, timestamps: true })
export class Subscription {
  @Prop({ required: true })
  planName: string;

  @Prop({ type: String, default: "" })
  description?: string;

  @Prop({ required: true, default: 0 })
  amount: number; // backward compatibility

  @Prop({ required: true, default: 0 })
  monthlyPrice: number;

  @Prop({ required: true, default: 0 })
  halfYearlyPrice: number;

  @Prop({ required: true, default: 0 })
  yearlyPrice: number;

  @Prop({ type: Number, default: 5 })
  doctorLimit: number;

  @Prop({ type: Number, default: 1000 })
  patientLimit: number;

  @Prop({ type: Number, default: 10 })
  staffLimit: number;

  @Prop({ type: String, default: "monthly" })
  billingCycle: string;

  @Prop({ required: true, default: 30 })
  durationInDays: number;

  @Prop({ enum: ActiveInactiveStatus, default: ActiveInactiveStatus.ACTIVE })
  status: ActiveInactiveStatus;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ActiveInactiveStatus } from "../../constant/enums/status.enum";

export type SubscriptionDocument = Subscription & Document;

@Schema({ versionKey: false, timestamps: true })
export class Subscription {
  @Prop({ required: true })
  planName: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  durationInDays: number;

  @Prop({ enum: ActiveInactiveStatus, default: ActiveInactiveStatus.ACTIVE })
  status: ActiveInactiveStatus;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

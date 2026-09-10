import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Person } from "src/common/schemas/person.schema";
import { collectionsName, RolesEnum, Status } from "src/constant";
import { SubscriptionStatus } from "src/constant/enums/status.enum";

export type MerchantDocument = Merchant & Document;

@Schema({ timestamps: true, versionKey: false })
export class Merchant extends Person {
  @Prop({
    type: String,
    enum: RolesEnum,
    default: RolesEnum.MERCHANT,
  })
  role: RolesEnum;

  @Prop({ type: Types.ObjectId, ref: collectionsName.user, required: false })
  user?: Types.ObjectId;

  // Merchant specific
  @Prop({ required: true })
  clinicName: string;

  @Prop({ required: true })
  clinicAddress: string;

  @Prop({ required: true })
  licenseNumber: string;

  @Prop({
    type: String,
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @Prop({ type: Types.ObjectId, ref: collectionsName.subscription })
  subscriptionPackage: Types.ObjectId;

  @Prop({ type: Date, required: true })
  subscriptionStartDate: Date;

  @Prop({ type: Date, required: true })
  subscriptionEndDate: Date;

  @Prop({
    type: String,
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  subscriptionStatus: string;

  @Prop({ type: Number, default: 0 })
  numberOfBeds: number;

  @Prop({ type: [String], default: [] })
  servicesOffered: string[];
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);

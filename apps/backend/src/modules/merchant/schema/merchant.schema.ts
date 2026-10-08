import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Person } from "../../../common/schemas/person.schema";
import { collectionsName, RolesEnum, Status } from "../../../constant";
import { SubscriptionStatus } from "../../../constant/enums/status.enum";

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

  // Tenant domain configuration
  @Prop({ type: String, trim: true, lowercase: true, unique: true, sparse: true })
  subdomain?: string;

  @Prop({ type: String, trim: true, lowercase: true, unique: true, sparse: true })
  domain?: string;

  @Prop({ type: String, trim: true, lowercase: true, unique: true, sparse: true })
  customDomain?: string;

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
  subscriptionPackage?: Types.ObjectId;

  @Prop({ type: Date, required: false })
  subscriptionStartDate?: Date;

  @Prop({ type: Date, required: false })
  subscriptionEndDate?: Date;

  @Prop({
    type: String,
    enum: SubscriptionStatus,
    default: SubscriptionStatus.DEMO,
  })
  subscriptionStatus: string;

  @Prop({ type: Number, default: 0 })
  numberOfBeds: number;

  @Prop({ type: [String], default: [] })
  servicesOffered: string[];
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);
MerchantSchema.index({ subdomain: 1 }, { unique: true, sparse: true });
MerchantSchema.index({ domain: 1 }, { unique: true, sparse: true });
MerchantSchema.index({ customDomain: 1 }, { unique: true, sparse: true });
MerchantSchema.index({ user: 1 });

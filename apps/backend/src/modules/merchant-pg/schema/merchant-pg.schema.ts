import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";

@Schema({ _id: false })
class SSLCommerzSchema {
  @Prop({ type: Boolean, default: false })
  isActive: boolean;

  @Prop({ type: String })
  storeId?: string;

  @Prop({ type: String })
  storePassword?: string;

  @Prop({ type: Boolean, default: false })
  isSandbox?: boolean;
}

@Schema({ timestamps: true, versionKey: false })
export class MerchantPG extends Document {
  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;

  @Prop({ type: SSLCommerzSchema })
  sslcommerz?: SSLCommerzSchema;
}

export const MerchantPGSchema = SchemaFactory.createForClass(MerchantPG);

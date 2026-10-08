import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";
import { ServiceCategory } from "../../../constant/enums/status.enum";

export type ServiceCatalogDocument = ServiceCatalog & Document;

@Schema({ timestamps: true })
export class ServiceCatalog {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: ServiceCategory, default: ServiceCategory.SERVICE })
  category: ServiceCategory;

  @Prop({ default: "" })
  description?: string;

  @Prop({ required: true, default: 0 })
  defaultPrice: number;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ default: true })
  discountEligible: boolean;

  @Prop({ default: false })
  commissionEligible: boolean;

  @Prop({ default: false })
  inventoryImpact: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  serviceDuration?: number;

  @Prop({ default: "" })
  department?: string;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true, index: true })
  merchant: Types.ObjectId;
}

export const ServiceCatalogSchema = SchemaFactory.createForClass(ServiceCatalog);
ServiceCatalogSchema.index({ merchant: 1, category: 1 });
ServiceCatalogSchema.index({ merchant: 1, name: 1 });

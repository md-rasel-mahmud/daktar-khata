import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "src/constant";

export type TestCatalogDocument = TestCatalog & Document;

@Schema({ timestamps: true, versionKey: false })
export class TestCatalog {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, trim: true })
  category?: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: String, trim: true })
  sampleType?: string;

  @Prop({ type: String, trim: true })
  turnaroundTime?: string;

  @Prop({ type: String, trim: true })
  preparationInstructions?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;
}

export const TestCatalogSchema = SchemaFactory.createForClass(TestCatalog);

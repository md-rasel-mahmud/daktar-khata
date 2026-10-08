import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";
import { TestOrderStatus } from "../../../constant/enums/status.enum";

export type TestOrderDocument = TestOrder & Document;

@Schema({ _id: false })
export class TestOrderItem {
  @Prop({ type: Types.ObjectId, ref: collectionsName.testCatalog, required: true })
  test: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  testName: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({
    type: String,
    enum: TestOrderStatus,
    default: TestOrderStatus.ORDERED,
  })
  status: string;

  @Prop({ type: String, trim: true })
  notes?: string;
}

export const TestOrderItemSchema = SchemaFactory.createForClass(TestOrderItem);

@Schema({ timestamps: true, versionKey: false })
export class TestOrder {
  @Prop({ type: Types.ObjectId, ref: collectionsName.patient, required: true })
  patient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.doctor, required: true })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.encounter })
  encounter?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;

  @Prop({ type: [TestOrderItemSchema], default: [] })
  items: TestOrderItem[];

  @Prop({
    type: String,
    enum: TestOrderStatus,
    default: TestOrderStatus.ORDERED,
  })
  status: string;
}

export const TestOrderSchema = SchemaFactory.createForClass(TestOrder);

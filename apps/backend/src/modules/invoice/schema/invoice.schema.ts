import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";
import {
  InvoiceStatus,
  PaymentMethod,
  ServiceCategory,
} from "../../../constant/enums/status.enum";

export type InvoiceDocument = Invoice & Document;

@Schema({ _id: false })
export class LineItem {
  @Prop({ type: Types.ObjectId, ref: collectionsName.serviceCatalog, default: null })
  service?: Types.ObjectId;

  @Prop({ required: true })
  serviceName: string;

  @Prop({ enum: ServiceCategory, default: ServiceCategory.SERVICE })
  category?: ServiceCategory;

  @Prop({ required: true, min: 1, default: 1 })
  quantity: number;

  @Prop({ required: true, min: 0, default: 0 })
  unitPrice: number;

  @Prop({ default: 0, min: 0 })
  discount: number;

  @Prop({ default: 0, min: 0 })
  tax: number;

  @Prop({ required: true, default: 0 })
  total: number;
}
export const LineItemSchema = SchemaFactory.createForClass(LineItem);

@Schema({ _id: false })
export class InvoicePayment {
  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, default: PaymentMethod.CASH })
  method: string;

  @Prop({ default: "" })
  transactionId?: string;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ default: "" })
  note?: string;

  @Prop({ type: Types.ObjectId, ref: collectionsName.user, default: null })
  recordedBy?: Types.ObjectId;
}
export const InvoicePaymentSchema = SchemaFactory.createForClass(InvoicePayment);

@Schema({ _id: false })
export class InvoiceRefund {
  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: "" })
  reason?: string;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: collectionsName.user, default: null })
  refundedBy?: Types.ObjectId;
}
export const InvoiceRefundSchema = SchemaFactory.createForClass(InvoiceRefund);

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, index: true })
  invoiceNumber: string;

  @Prop({ type: Types.ObjectId, ref: collectionsName.patient, required: true, index: true })
  patient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.doctor, default: null, index: true })
  doctor?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.admission, default: null })
  admission?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.appointment, default: null })
  appointment?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true, index: true })
  merchant: Types.ObjectId;

  @Prop({
    required: true,
    enum: InvoiceStatus,
    default: InvoiceStatus.ISSUED,
    index: true,
  })
  status: InvoiceStatus;

  @Prop({ default: Date.now })
  issuedDate: Date;

  @Prop({ default: null })
  dueDate?: Date;

  @Prop({ default: "" })
  notes?: string;

  @Prop({ type: [LineItemSchema], default: [] })
  lineItems: LineItem[];

  @Prop({ required: true, default: 0 })
  subtotal: number;

  @Prop({ required: true, default: 0 })
  totalDiscount: number;

  @Prop({ required: true, default: 0 })
  totalTax: number;

  @Prop({ required: true, default: 0 })
  grandTotal: number;

  @Prop({ required: true, default: 0 })
  paidAmount: number;

  @Prop({ required: true, default: 0 })
  dueAmount: number;

  @Prop({ required: true, default: 0 })
  refundAmount: number;

  @Prop({ type: [InvoicePaymentSchema], default: [] })
  paymentHistory: InvoicePayment[];

  @Prop({ type: [InvoiceRefundSchema], default: [] })
  refundHistory: InvoiceRefund[];

  @Prop({ default: true })
  isActive: boolean;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
InvoiceSchema.index({ merchant: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ merchant: 1, status: 1 });
InvoiceSchema.index({ merchant: 1, patient: 1 });
InvoiceSchema.index({ merchant: 1, doctor: 1 });

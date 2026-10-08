import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";
import {
  PayrollStatus,
  SalaryType,
} from "../../../constant/enums/status.enum";

export type PayrollDocument = Payroll & Document;

@Schema({ timestamps: true })
export class Payroll {
  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.merchant,
    required: true,
    index: true,
  })
  merchant: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.staff,
    default: null,
    index: true,
  })
  staff?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.doctor,
    default: null,
    index: true,
  })
  doctor?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  recipientName: string;

  @Prop({ required: true, trim: true })
  recipientRole: string;

  @Prop({ required: true, trim: true, index: true })
  billingCycle: string; // e.g. "2026-09"

  @Prop({
    type: String,
    enum: SalaryType,
    default: SalaryType.MONTHLY,
  })
  salaryType: SalaryType;

  @Prop({ required: true, min: 0, default: 0 })
  baseSalary: number;

  @Prop({ default: 0 })
  attendanceDays: number;

  @Prop({ default: 0 })
  attendanceAdjustment: number;

  @Prop({ default: 0 })
  overtime: number;

  @Prop({ default: 0 })
  commission: number;

  @Prop({ default: 0 })
  bonus: number;

  @Prop({ default: 0 })
  deduction: number;

  @Prop({ default: 0 })
  advance: number;

  @Prop({ required: true, min: 0, default: 0 })
  netPayable: number;

  @Prop({
    type: String,
    enum: PayrollStatus,
    default: PayrollStatus.DRAFT,
    index: true,
  })
  status: PayrollStatus;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.user,
    default: null,
  })
  approvedBy?: Types.ObjectId;

  @Prop({ default: null })
  approvedAt?: Date;

  @Prop({ default: null })
  paidAt?: Date;

  @Prop({ default: "CASH" })
  paymentMethod?: string;

  @Prop({ default: "" })
  transactionReference?: string;

  @Prop({ default: "" })
  notes?: string;

  @Prop({ default: false })
  isLocked: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const PayrollSchema = SchemaFactory.createForClass(Payroll);
PayrollSchema.index({ merchant: 1, staff: 1, billingCycle: 1 });
PayrollSchema.index({ merchant: 1, billingCycle: 1, status: 1 });
PayrollSchema.index({ merchant: 1, doctor: 1, billingCycle: 1 });

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";
import {
  LeaveStatusEnum,
  PayrollStatusEnum,
  StaffRoleEnum,
} from "../../../constant/enums/staff-role.enum";
import { SalaryType } from "../../../constant/enums/status.enum";

export type StaffDocument = Staff & Document;

@Schema({ _id: false })
export class BankDetails {
  @Prop({ default: "" })
  accountName?: string;

  @Prop({ default: "" })
  accountNumber?: string;

  @Prop({ default: "" })
  bankName?: string;

  @Prop({ default: "" })
  branchName?: string;

  @Prop({ default: "" })
  routingNumber?: string;
}
export const BankDetailsSchema = SchemaFactory.createForClass(BankDetails);

@Schema({ versionKey: false, timestamps: true })
export class Staff {
  @Prop({ type: Types.ObjectId, ref: collectionsName.user, required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.clinic })
  clinic?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ trim: true })
  email?: string;

  @Prop({ type: String, required: true, enum: StaffRoleEnum })
  staffRole: StaffRoleEnum;

  @Prop({ trim: true })
  customRoleName?: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ trim: true })
  designation?: string;

  @Prop({ type: Number, default: 0 })
  salary: number;

  @Prop({ type: String, enum: SalaryType, default: SalaryType.MONTHLY })
  salaryType: SalaryType;

  @Prop({ type: BankDetailsSchema, default: () => ({}) })
  bankDetails: BankDetails;

  @Prop({ type: Number, default: 12 })
  leaveBalance: number;

  @Prop({ type: Date, default: Date.now })
  joinedAt: Date;

  @Prop({ default: true })
  active: boolean;

  @Prop({ trim: true })
  notes?: string;

  @Prop({
    type: [
      {
        fromDate: { type: Date, required: true },
        toDate: { type: Date, required: true },
        reason: { type: String, required: true, trim: true },
        status: {
          type: String,
          enum: LeaveStatusEnum,
          default: LeaveStatusEnum.PENDING,
        },
        approvedBy: { type: Types.ObjectId, ref: collectionsName.user },
        approvedAt: { type: Date },
        remarks: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  leaveRequests: {
    _id?: Types.ObjectId;
    fromDate: Date;
    toDate: Date;
    reason: string;
    status: LeaveStatusEnum;
    approvedBy?: Types.ObjectId;
    approvedAt?: Date;
    remarks?: string;
    createdAt?: Date;
  }[];

  @Prop({
    type: [
      {
        month: { type: Number, required: true, min: 1, max: 12 },
        year: { type: Number, required: true },
        basicSalary: { type: Number, required: true, min: 0 },
        bonus: { type: Number, default: 0 },
        deduction: { type: Number, default: 0 },
        netPay: { type: Number, required: true, min: 0 },
        status: {
          type: String,
          enum: PayrollStatusEnum,
          default: PayrollStatusEnum.PENDING,
        },
        paidAt: { type: Date },
        note: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  payrolls: {
    _id?: Types.ObjectId;
    month: number;
    year: number;
    basicSalary: number;
    bonus: number;
    deduction: number;
    netPay: number;
    status: PayrollStatusEnum;
    paidAt?: Date;
    note?: string;
    createdAt?: Date;
  }[];
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
StaffSchema.index({ merchant: 1, phone: 1 }, { unique: true });
StaffSchema.index({ merchant: 1, staffRole: 1 });

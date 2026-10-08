import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";
import {
  AppointmentStatus,
  PaymentMethod,
  PaymentStatus,
  QueueStatus,
} from "../../../constant/enums/status.enum";

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true, versionKey: false })
export class Appointment {
  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.patient,
    required: true,
  })
  patient: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.doctor,
    required: true,
  })
  doctor: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.merchant,
    required: true,
  })
  merchant: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  transactionId: string;

  @Prop({
    type: Date,
    required: true,
  })
  appointmentDate: Date;

  @Prop({ type: String, required: true, trim: true })
  appointmentSlot: string;

  @Prop({ type: String, required: true, trim: true })
  reasonFor: string;

  @Prop({
    type: String,
    trim: true,
  })
  problemDescription?: string;

  @Prop({
    type: String,
    trim: true,
  })
  note?: string;

  @Prop({
    type: String,
    trim: true,
    default: PaymentStatus.PENDING,
    enum: PaymentStatus,
  })
  paymentStatus: string;

  @Prop({
    type: String,
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod?: string;

  @Prop({
    type: String,
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status?: string;

  @Prop({
    type: String,
    enum: QueueStatus,
    default: QueueStatus.WAITING,
  })
  queueStatus?: string;

  @Prop({
    type: Number,
  })
  serialNumber?: number;

  @Prop({
    type: [
      {
        previousDate: Date,
        previousSlot: String,
        newDate: Date,
        newSlot: String,
        reason: String,
        rescheduledAt: { type: Date, default: Date.now },
        rescheduledBy: Types.ObjectId, // User ID who rescheduled
      },
    ],
    default: [],
  })
  rescheduleHistory?: {
    previousDate: Date;
    previousSlot: string;
    newDate: Date;
    newSlot: string;
    reason: string;
    rescheduledAt: Date;
    rescheduledBy: Types.ObjectId;
  }[];

  @Prop({
    type: String,
    trim: true,
  })
  cancellationReason?: string;

  @Prop({
    type: Date,
  })
  cancelledAt?: Date;

  @Prop({
    type: Types.ObjectId,
    ref: collectionsName.user,
  })
  cancelledBy?: Types.ObjectId;

  @Prop({
    type: Date,
  })
  completedAt?: Date;

  @Prop({
    type: String,
    trim: true,
  })
  prescriptionNotes?: string;

  @Prop({
    type: String,
    trim: true,
  })
  diagnosis?: string;

  // ---- Consultation queue ----

  /** Emergency patients are sorted ahead of the serial order. */
  @Prop({ type: Boolean, default: false })
  isEmergency?: boolean;

  @Prop({ type: Date })
  checkedInAt?: Date;

  @Prop({ type: Date })
  calledAt?: Date;

  @Prop({ type: Date })
  consultationStartedAt?: Date;

  @Prop({
    type: [
      {
        from: String,
        to: String,
        changedBy: Types.ObjectId,
        changedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  queueHistory?: {
    from: string;
    to: string;
    changedBy: Types.ObjectId;
    changedAt: Date;
  }[];
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

AppointmentSchema.index({ doctor: 1, appointmentDate: 1, queueStatus: 1 });

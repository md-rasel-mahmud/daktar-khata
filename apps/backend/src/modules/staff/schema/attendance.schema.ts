import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";
import { AttendanceStatusEnum } from "../../../constant/enums/staff-role.enum";

export type AttendanceDocument = Attendance & Document;

@Schema({ versionKey: false, timestamps: true })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: collectionsName.employee, required: true })
  staff: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Date })
  checkIn?: Date;

  @Prop({ type: Date })
  checkOut?: Date;

  @Prop({
    type: String,
    enum: AttendanceStatusEnum,
    default: AttendanceStatusEnum.PRESENT,
  })
  status: AttendanceStatusEnum;

  @Prop({ type: String, trim: true })
  note?: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index({ merchant: 1, staff: 1, date: 1 }, { unique: true });

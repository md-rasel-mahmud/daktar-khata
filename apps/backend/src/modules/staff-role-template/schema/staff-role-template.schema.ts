import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";
import { StaffRoleEnum } from "../../../constant/enums/staff-role.enum";

export type StaffRoleTemplateDocument = StaffRoleTemplate & Document;

@Schema({ versionKey: false, timestamps: true })
export class StaffRoleTemplate {
  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, index: true })
  merchant?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  key: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, enum: StaffRoleEnum, required: true })
  staffRole: StaffRoleEnum;

  @Prop({ trim: true })
  customRoleName?: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Boolean, default: false })
  isSystem: boolean;

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const StaffRoleTemplateSchema =
  SchemaFactory.createForClass(StaffRoleTemplate);

StaffRoleTemplateSchema.index({ merchant: 1, key: 1 }, { unique: true });

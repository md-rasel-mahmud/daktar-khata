import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { RolesEnum } from "../../../constant";
import * as bcrypt from "bcrypt";

import { Status, collectionsName } from "../../../constant";

@Schema({ versionKey: false, timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: false })
  name?: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: false, sparse: true })
  email?: string;

  @Prop({
    type: String,
    enum: Object.values(RolesEnum),
    default: RolesEnum.PATIENT,
  })
  role: RolesEnum;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: false })
  merchant?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.clinic, required: false })
  clinic?: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(Status),
    default: Status.ACTIVE,
  })
  status: Status;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ phone: 1, merchant: 1 });
UserSchema.index({ email: 1, merchant: 1 }, { sparse: true });
UserSchema.index({ role: 1 });

UserSchema.pre<User>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(this.password, saltRounds);
  this.password = hashedPassword;
  next();
});

export { UserSchema };

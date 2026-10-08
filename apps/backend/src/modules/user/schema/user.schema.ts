import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { RolesEnum } from "../../../constant";
import * as bcrypt from "bcrypt";

@Schema({ versionKey: false, timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: true, unique: true })
  phone: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, unique: true, required: false, sparse: true })
  email?: string;

  @Prop({
    type: String,
    enum: Object.values(RolesEnum),
    default: RolesEnum.PATIENT,
  })
  role: RolesEnum;
}

const UserSchema = SchemaFactory.createForClass(User);

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

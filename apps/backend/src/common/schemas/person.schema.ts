import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Gender, Status } from "../../constant";

@Schema({ versionKey: false, timestamps: true })
export class Person extends Document {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, unique: true, required: false, sparse: true })
  email?: string;

  @Prop({
    type: String,
    enum: Object.values(Status),
    default: Status.NEW,
  })
  status: Status;

  @Prop({
    type: String,
    required: false,
    unique: true,
    sparse: true,
  })
  mobile: string;

  @Prop({ type: String, required: false, trim: true })
  address?: string;

  @Prop({ type: String, required: false, trim: true })
  note?: string;

  @Prop({
    type: String,
    enum: Gender,
  })
  gender: Gender;
}

export const PersonaSchema = SchemaFactory.createForClass(Person);

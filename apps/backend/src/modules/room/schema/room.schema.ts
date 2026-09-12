import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "src/constant";

export type RoomDocument = Room & Document;

@Schema({ timestamps: true, versionKey: false })
export class Room {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: collectionsName.ward, required: true })
  ward: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: collectionsName.merchant, required: true })
  merchant: Types.ObjectId;

  @Prop({ type: String, trim: true })
  floor?: string;

  @Prop({ type: String, trim: true })
  roomType?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

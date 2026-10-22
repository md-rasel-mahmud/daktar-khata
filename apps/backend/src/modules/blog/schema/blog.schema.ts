import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { collectionsName } from "../../../constant";

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true, versionKey: false })
export class Blog {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ trim: true, default: "" })
  description: string;

  @Prop({ required: true })
  content: string; // rich HTML content

  @Prop({ trim: true, default: "Healthcare" })
  category: string;

  @Prop({ trim: true, default: "" })
  image?: string;

  @Prop({ trim: true, default: "Admin" })
  authorName: string;

  @Prop({ type: Types.ObjectId, ref: collectionsName.user, required: false })
  author?: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isPublished: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Number, default: 0 })
  views: number;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.index({ slug: 1 }, { unique: true });
BlogSchema.index({ isPublished: 1, createdAt: -1 });
BlogSchema.index({ category: 1 });

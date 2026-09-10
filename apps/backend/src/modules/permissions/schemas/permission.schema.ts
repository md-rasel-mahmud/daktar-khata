import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

@Schema({ versionKey: false, timestamps: true })
export class Permission extends Document {
  @ApiProperty({
    example: "USER_CREATE",
    description:
      "A unique permission key (used internally to check permissions)",
  })
  @Prop({ required: true, unique: true })
  key: string;

  @ApiProperty({
    example: "Create User",
    description: "Readable name of the permission",
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    example: "User Management",
    description: "Module or feature group this permission belongs to",
  })
  @Prop()
  module: string;

  @ApiProperty({
    example: "Allows creating new user accounts",
    description: "Detailed description of what this permission allows",
    required: false,
  })
  @Prop()
  description?: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

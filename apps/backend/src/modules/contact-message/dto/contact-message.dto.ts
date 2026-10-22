import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { ContactMessageStatus } from "../schema/contact-message.schema";

export class CreateContactMessageDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}

export class UpdateContactMessageStatusDto {
  @IsNotEmpty()
  @IsEnum(ContactMessageStatus)
  status: ContactMessageStatus;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}

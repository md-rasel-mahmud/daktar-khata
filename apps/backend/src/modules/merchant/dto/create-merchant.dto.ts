import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
  IsEnum,
  IsEmail,
  IsMobilePhone,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Types } from "mongoose";
import { PersonDto } from "src/common/dto/person.dto";
import { RolesEnum, Status } from "src/constant";

export class CreateMerchantDto extends PersonDto {
  @ApiProperty({
    example: "01712345678",
    description: "Phone number of the user",
  })
  @IsMobilePhone()
  @IsNotEmpty({ message: "Phone number is required and must be valid" })
  phone: string;

  @ApiPropertyOptional({
    example: "example@gmail.com",
    description: "Email address of the user",
  })
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: "securePassword123",
    description: "Password for the user account",
  })
  @IsString({ message: "Invalid password" })
  @IsNotEmpty({ message: "Password is required" })
  password: string;

  @ApiPropertyOptional({
    enum: RolesEnum,
    description:
      "Role of the user. Only PATIENT or MERCHANT allowed for signup",
  })
  @IsEnum(RolesEnum)
  @IsOptional()
  role?: RolesEnum;

  @ApiPropertyOptional({
    example: "652e0a823a37a1f8e82fdd4b",
    description: "Reference to existing user ID (if applicable)",
  })
  @IsMongoId()
  @IsOptional()
  user?: Types.ObjectId;

  // Merchant specific fields

  @ApiProperty({
    description: "Profile ID associated with the merchant",
    example: "652fcf2c4f2b09a4b5a4c2a8",
  })
  @ApiProperty({
    description: "Name of the clinic or institution",
    example: "Shunno Diagnostic Center",
  })
  @IsString()
  @IsNotEmpty()
  clinicName: string;

  @ApiProperty({
    description: "Address of the clinic",
    example: "House #12, Road #5, Rajshahi, Bangladesh",
  })
  @IsString()
  @IsNotEmpty()
  clinicAddress: string;

  @ApiProperty({
    description: "Clinic license or registration number",
    example: "LIC-2025-0345",
  })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({
    description: "Date when the subscription started",
    example: "2025-01-01T00:00:00.000Z",
  })
  @IsDateString()
  @IsNotEmpty()
  subscriptionStartDate: string;

  @ApiProperty({
    description: "Date when the subscription will end",
    example: "2026-01-01T00:00:00.000Z",
  })
  @IsDateString()
  @IsNotEmpty()
  subscriptionEndDate: string;

  @ApiPropertyOptional({
    description: "Total number of beds available in the clinic",
    example: 45,
  })
  @IsNumber()
  @IsOptional()
  numberOfBeds?: number;

  @ApiPropertyOptional({
    description: "List of services offered by the clinic",
    example: ["Ultrasonography", "Hernia Operation", "Gallstone Surgery"],
  })
  @IsArray()
  @IsOptional()
  servicesOffered?: string[];

  @ApiPropertyOptional({
    description: "Indicates if the merchant account is active",
    example: Status.ACTIVE,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status = Status.ACTIVE;
}

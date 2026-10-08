import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Types } from "mongoose";
import { PersonDto } from "../../../common/dto/person.dto";
import { RolesEnum, Status } from "../../../constant";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AuthDto {
  @ApiProperty({
    example: "01712345678",
    description: "Phone number used for login",
  })
  @IsMobilePhone()
  @IsNotEmpty({ message: "Phone number is required and must be valid" })
  phone: string;

  @ApiProperty({
    example: "password123",
    description: "Password for authentication",
  })
  @IsString({ message: "Invalid password" })
  @IsNotEmpty({ message: "Password is required" })
  password: string;
}

export class RegisterDto extends PersonDto {
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

  // Patient specific
  @ApiProperty({
    example: "O+",
    description: "Blood group of the user",
  })
  @IsOptional()
  @IsString()
  bloodGroup: string;

  @ApiPropertyOptional({
    example: "01787654321",
    description: "Emergency contact phone number",
  })
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @ApiPropertyOptional({
    example: "Diabetes, Hypertension",
    description: "Medical history or past health conditions",
  })
  @IsString()
  @IsOptional()
  medicalHistory?: string;

  @ApiPropertyOptional({
    example: ["Paracetamol", "Insulin"],
    description: "List of current medications",
    type: [String],
  })
  @IsArray()
  @IsOptional()
  currentMedications?: string[];

  @ApiPropertyOptional({
    description: "Date when the patient last visited the clinic",
    example: "2025-02-15T00:00:00.000Z",
  })
  @IsDateString()
  @IsOptional()
  lastVisited?: Date;

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
  @IsOptional()
  clinicName: string;

  @ApiProperty({
    description: "Address of the clinic",
    example: "House #12, Road #5, Rajshahi, Bangladesh",
  })
  @IsString()
  @IsOptional()
  clinicAddress: string;

  @ApiProperty({
    description: "Clinic license or registration number",
    example: "LIC-2025-0345",
  })
  @IsString()
  @IsOptional()
  licenseNumber: string;

  @ApiProperty({
    description: "Date when the subscription started",
    example: "2025-01-01T00:00:00.000Z",
  })
  @IsDateString()
  @IsOptional()
  subscriptionStartDate: string;

  @ApiProperty({
    description: "Date when the subscription will end",
    example: "2026-01-01T00:00:00.000Z",
  })
  @IsDateString()
  @IsOptional()
  subscriptionEndDate: string;

  @ApiPropertyOptional({
    description: "Current status of the subscription",
    example: "active",
  })
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

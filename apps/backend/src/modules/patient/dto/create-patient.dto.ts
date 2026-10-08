import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Types } from "mongoose";
import { PersonDto } from "../../../common/dto/person.dto";

export class CreatePatientDto extends PersonDto {
  @ApiProperty({
    description: "User ID linked with this patient record",
    example: "652fcf2c4f2b09a4b5a4c2a8",
  })
  @IsMongoId()
  @IsNotEmpty()
  user: Types.ObjectId;

  @ApiPropertyOptional({
    description: "Merchant ID linked with this patient record",
    example: "652fcf2c4f2b09a4b5a4c2a8",
  })
  @IsMongoId()
  @IsOptional()
  merchant?: Types.ObjectId;

  @ApiPropertyOptional({
    description: "Clinic branch ID linked with this patient record",
    example: "652fcf2c4f2b09a4b5a4c2a8",
  })
  @IsMongoId()
  @IsOptional()
  clinic?: Types.ObjectId;

  @ApiProperty({
    description: "Patient’s blood group",
    example: "O+",
  })
  @IsString()
  @IsNotEmpty()
  bloodGroup: string;

  @ApiPropertyOptional({
    description: "Emergency contact number for the patient",
    example: "+8801712345678",
  })
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @ApiPropertyOptional({
    description: "Brief medical history of the patient",
    example: "Diabetes, High Blood Pressure",
  })
  @IsString()
  @IsOptional()
  medicalHistory?: string;

  @ApiPropertyOptional({
    description: "List of current medications the patient is taking",
    example: ["Metformin", "Atorvastatin"],
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
}

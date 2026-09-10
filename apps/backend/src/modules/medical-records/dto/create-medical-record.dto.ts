import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateMedicalRecordDto {
  @ApiProperty({
    description: "Patient ID linked to this medical record",
    example: "652fcf2c4f2b09a4b5a4c2a8",
  })
  @IsMongoId()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: "Doctor ID responsible for this record",
    example: "652f9f18c1b2a4a7b8f67890",
  })
  @IsMongoId()
  @IsNotEmpty()
  doctorId: string;

  @ApiPropertyOptional({
    description: "Optional appointment ID for the consultation",
    example: "6530a2c44cb2dbd2a1111111",
  })
  @IsMongoId()
  @IsOptional()
  appointmentId?: string;

  @ApiPropertyOptional({
    description: "Medical record date in ISO format",
    example: "2025-10-20T10:30:00.000Z",
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({
    description: "Diagnosis or clinical assessment",
    example: "Mild hypertension",
  })
  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @ApiPropertyOptional({
    description: "List of prescribed medicines or instructions",
    example: ["Lisinopril 10mg once daily"],
  })
  @IsArray()
  @IsOptional()
  prescription?: string[];

  @ApiPropertyOptional({
    description: "Doctor notes",
    example: "Reduce sodium intake and monitor BP twice a week.",
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: "Follow-up date in ISO format",
    example: "2025-11-20T10:30:00.000Z",
  })
  @IsDateString()
  @IsOptional()
  followUpDate?: string;

  @ApiPropertyOptional({
    description: "User who recorded the record",
    example: "652e0a823a37a1f8e82fdd4b",
  })
  @IsString()
  @IsOptional()
  recordedBy?: string;
}

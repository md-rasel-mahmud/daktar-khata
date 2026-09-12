import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateAdmissionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  patient: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  doctor: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  clinic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  ward?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  room?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  bed?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedDischargeDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  responsibleStaff?: string;
}

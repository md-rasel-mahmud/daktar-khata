import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsOptional, IsString, IsArray, IsObject, IsDateString, IsBoolean } from "class-validator";

export class CreateEncounterDto {
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
  appointment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  symptoms?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  vitals?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clinicalNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  testOrders?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  advice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  admissionRecommended?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  operationRecommended?: boolean;
}

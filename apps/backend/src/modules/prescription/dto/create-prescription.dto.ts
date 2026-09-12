import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class MedicineItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timing?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(["BEFORE", "AFTER", "WITH"])
  beforeAfterMeal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  patient: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  doctor: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  encounter: string;

  @ApiProperty({ type: [MedicineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicineItemDto)
  medicines: MedicineItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class LogVitalsDto {
  @ApiPropertyOptional({ example: "120/80" })
  @IsOptional()
  @IsString()
  bloodPressure?: string;

  @ApiPropertyOptional({ example: 76 })
  @IsOptional()
  @IsNumber()
  pulse?: number;

  @ApiPropertyOptional({ example: 98.6 })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ example: 99 })
  @IsOptional()
  @IsNumber()
  spO2?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsNumber()
  respiratoryRate?: number;

  @ApiPropertyOptional({ example: "Patient stable and afebrile" })
  @IsOptional()
  @IsString()
  notes?: string;
}

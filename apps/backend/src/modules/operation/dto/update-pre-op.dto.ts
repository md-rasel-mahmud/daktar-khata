import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdatePreOpDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  consentRecorded?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  reportsAvailable?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  patientVerified?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  bloodGroupConfirmed?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  suppliesAvailable?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  anesthesiaAssessmentCompleted?: boolean;

  @ApiPropertyOptional({ example: "Patient NPO since 12:00 AM" })
  @IsOptional()
  @IsString()
  notes?: string;
}

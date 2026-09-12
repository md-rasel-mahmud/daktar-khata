import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class DischargeMedicineDto {
  @ApiProperty({ example: "Tab. Cefuroxime" })
  @IsNotEmpty()
  @IsString()
  medicineName: string;

  @ApiProperty({ example: "500mg" })
  @IsNotEmpty()
  @IsString()
  dose: string;

  @ApiProperty({ example: "1+0+1" })
  @IsNotEmpty()
  @IsString()
  frequency: string;

  @ApiProperty({ example: "5 days" })
  @IsNotEmpty()
  @IsString()
  duration: string;

  @ApiPropertyOptional({ example: "After food" })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreateDischargeSummaryDto {
  @ApiProperty({ example: "64e7c3b2f1a2b3c4d5e6f7a8" })
  @IsNotEmpty()
  @IsMongoId()
  admission: string;

  @ApiProperty({ example: "64e7c3b2f1a2b3c4d5e6f7a9" })
  @IsNotEmpty()
  @IsMongoId()
  patient: string;

  @ApiProperty({ example: "64e7c3b2f1a2b3c4d5e6f7aa" })
  @IsNotEmpty()
  @IsMongoId()
  doctor: string;

  @ApiPropertyOptional({ example: "2026-09-20T10:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  dischargeDate?: string;

  @ApiProperty({ example: "Acute Appendicitis - Post Laparoscopic Appendectomy" })
  @IsNotEmpty()
  @IsString()
  finalDiagnosis: string;

  @ApiPropertyOptional({ example: "Patient underwent successful appendectomy on 15/09/2026. Post-op recovery uneventful. Afebrile, tolerating regular diet, wound clean and dry." })
  @IsOptional()
  @IsString()
  treatmentSummary?: string;

  @ApiPropertyOptional({ example: "Laparoscopic appendectomy performed on 15/09/2026. Minimal adhesions." })
  @IsOptional()
  @IsString()
  operationSummary?: string;

  @ApiPropertyOptional({ type: [DischargeMedicineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DischargeMedicineDto)
  dischargeMedicines?: DischargeMedicineDto[];

  @ApiPropertyOptional({ example: "2026-09-27T09:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({ example: "High fever (>101°F), severe abdominal pain, persistent vomiting, or discharge from wound site." })
  @IsOptional()
  @IsString()
  warningSigns?: string;

  @ApiPropertyOptional({ example: "Avoid lifting heavy objects for 2 weeks. Keep surgical wound clean and dry." })
  @IsOptional()
  @IsString()
  doctorInstructions?: string;
}

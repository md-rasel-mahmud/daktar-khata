import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { OperationStatus } from "src/constant/enums/status.enum";

export class CreateOperationDto {
  @ApiProperty({ example: "64e7c3b2f1a2b3c4d5e6f7a8" })
  @IsNotEmpty()
  @IsMongoId()
  patient: string;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7a9" })
  @IsOptional()
  @IsMongoId()
  admission?: string;

  @ApiProperty({ example: "64e7c3b2f1a2b3c4d5e6f7aa" })
  @IsNotEmpty()
  @IsMongoId()
  leadSurgeon: string;

  @ApiPropertyOptional({ example: ["64e7c3b2f1a2b3c4d5e6f7ab"] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assistantSurgeons?: string[];

  @ApiPropertyOptional({ example: "Dr. Anesthesiologist Name" })
  @IsOptional()
  @IsString()
  anesthesiologist?: string;

  @ApiProperty({ example: "Laparoscopic Appendectomy" })
  @IsNotEmpty()
  @IsString()
  procedureName: string;

  @ApiPropertyOptional({ example: "Acute Appendicitis" })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ example: "OT-1 (Main Operating Theatre)" })
  @IsOptional()
  @IsString()
  theatreName?: string;

  @ApiPropertyOptional({ example: "General Anesthesia" })
  @IsOptional()
  @IsString()
  anesthesiaType?: string;

  @ApiPropertyOptional({ enum: OperationStatus, default: OperationStatus.PLANNED })
  @IsOptional()
  @IsEnum(OperationStatus)
  status?: OperationStatus;

  @ApiPropertyOptional({ example: "2026-09-15T09:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  scheduledStartTime?: string;

  @ApiPropertyOptional({ example: "2026-09-15T11:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  scheduledEndTime?: string;

  @ApiPropertyOptional({ example: 25000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  charges?: number;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { NursingTaskType } from "src/constant/enums/status.enum";

export class CreateNursingTaskDto {
  @ApiProperty({ example: "64e7c3b2f1a2b3c4d5e6f7a8" })
  @IsNotEmpty()
  @IsMongoId()
  patient: string;

  @ApiProperty({ example: "64e7c3b2f1a2b3c4d5e6f7a9" })
  @IsNotEmpty()
  @IsMongoId()
  admission: string;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7aa" })
  @IsOptional()
  @IsMongoId()
  bed?: string;

  @ApiProperty({ enum: NursingTaskType, example: NursingTaskType.VITALS_CHECK })
  @IsNotEmpty()
  @IsEnum(NursingTaskType)
  taskType: NursingTaskType;

  @ApiProperty({ example: "Check 2:00 PM Vitals" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: "Record BP, pulse, temp and SpO2" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "2026-09-15T14:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  scheduledTime?: string;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7ab" })
  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @ApiPropertyOptional({ example: "Patient reported mild headache in morning" })
  @IsOptional()
  @IsString()
  notes?: string;
}

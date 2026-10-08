import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { MedicationAdminStatus } from "../../../constant/enums/status.enum";

export class RecordAdministrationDto {
  @ApiProperty({
    enum: MedicationAdminStatus,
    example: MedicationAdminStatus.GIVEN,
  })
  @IsNotEmpty()
  @IsEnum(MedicationAdminStatus)
  status: MedicationAdminStatus;

  @ApiPropertyOptional({ example: "2026-09-15T08:10:00.000Z" })
  @IsOptional()
  @IsDateString()
  actualTime?: string;

  @ApiPropertyOptional({ example: "Patient vomiting / unable to tolerate oral intake" })
  @IsOptional()
  @IsString()
  skippedReason?: string;

  @ApiPropertyOptional({ example: "Tolerated well, no allergic reactions noted" })
  @IsOptional()
  @IsString()
  notes?: string;
}

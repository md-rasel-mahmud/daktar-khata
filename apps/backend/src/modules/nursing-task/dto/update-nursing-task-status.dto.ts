import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { NursingTaskStatus } from "src/constant/enums/status.enum";

export class UpdateNursingTaskStatusDto {
  @ApiProperty({ enum: NursingTaskStatus, example: NursingTaskStatus.COMPLETED })
  @IsNotEmpty()
  @IsEnum(NursingTaskStatus)
  status: NursingTaskStatus;

  @ApiPropertyOptional({ example: "Patient was sleeping / refused check" })
  @IsOptional()
  @IsString()
  skippedReason?: string;

  @ApiPropertyOptional({ example: "Dressing done, clean wound bed without signs of infection" })
  @IsOptional()
  @IsString()
  notes?: string;
}

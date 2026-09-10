import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AppointmentStatus } from "src/constant/enums/status.enum";

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    description: "New appointment status",
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
  })
  @IsNotEmpty()
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @ApiPropertyOptional({
    description: "Reason for status change (for cancellation or no-show)",
    example: "Patient did not show up",
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: "Additional notes",
    example: "Patient rescheduled",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

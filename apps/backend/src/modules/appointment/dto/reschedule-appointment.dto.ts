import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class RescheduleAppointmentDto {
  @ApiProperty({
    description: "New appointment date (ISO format)",
    example: "2025-10-21T10:30:00.000Z",
  })
  @IsNotEmpty()
  @IsDateString()
  newAppointmentDate: string;

  @ApiProperty({
    description: "New appointment slot (e.g., '10:30 AM - 11:00 AM')",
    example: "10:30 AM - 11:00 AM",
  })
  @IsNotEmpty()
  @IsString()
  newAppointmentSlot: string;

  @ApiProperty({
    description: "Reason for rescheduling",
    example: "Doctor has emergency",
  })
  @IsNotEmpty()
  @IsString()
  reason: string;
}

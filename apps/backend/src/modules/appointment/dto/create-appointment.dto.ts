import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { APPOINTMENT_TYPE } from "../../../constant/enums/appointment.enum";
import {
  AppointmentStatus,
  PaymentMethod,
} from "../../../constant/enums/status.enum";

export class CreateAppointmentDto {
  @ApiProperty({
    description: "Reference ID of the doctor (from Doctor collection)",
    example: "652f9f18c1b2a4a7b8f67890",
  })
  @IsNotEmpty()
  @IsMongoId()
  doctor: string;

  @ApiProperty({
    description: "Appointment date and time (ISO format)",
    example: "2025-10-20T10:30:00.000Z",
  })
  @IsNotEmpty()
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({
    description: "Appointment slot (e.g., '10:30 AM - 11:00 AM')",
    example: "10:30 AM - 11:00 AM",
  })
  @IsNotEmpty()
  @IsString()
  appointmentSlot: string;

  @ApiProperty({
    description: "Reason for the appointment",
    example: APPOINTMENT_TYPE.CHECK_UP,
    enum: APPOINTMENT_TYPE,
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(APPOINTMENT_TYPE)
  reasonFor: string;

  @ApiPropertyOptional({
    description: "Short description of the patient's problem",
    example: "Severe headache and nausea for 2 days",
  })
  @IsOptional()
  @IsString()
  problemDescription?: string;

  @ApiPropertyOptional({
    description: "Additional notes for the appointment",
    example: "Patient prefers morning appointments",
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: "Payment method used for the appointment",
    example: "sslcommerz, bkash, nagad, rocket, cash",
  })
  @IsOptional()
  @IsString()
  @IsEnum(PaymentMethod)
  paymentMethod: string;

  @ApiPropertyOptional({
    description: "Current appointment status",
    example: "pending",
  })
  @IsOptional()
  @IsString()
  @IsEnum(AppointmentStatus)
  status?: string;
}

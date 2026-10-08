import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";
import {
  NotificationPriority,
  NotificationType,
} from "../../../constant/enums/status.enum";

export class CreateNotificationDto {
  @ApiProperty({ example: "64e7c3b2f1a2b3c4d5e6f7a8" })
  @IsNotEmpty()
  @IsMongoId()
  recipient: string;

  @ApiPropertyOptional({
    enum: NotificationType,
    default: NotificationType.GENERAL,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiProperty({ example: "Appointment Confirmed" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: "Your appointment with Dr. Ahmed is confirmed for tomorrow at 10:00 AM.",
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: "Appointment" })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7a9" })
  @IsOptional()
  @IsMongoId()
  entityId?: string;

  @ApiPropertyOptional({ example: { appointmentId: "64e7c3b2f1a2b3c4d5e6f7a9" } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

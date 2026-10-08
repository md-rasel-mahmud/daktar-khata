import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { AuditEvent } from "../../../constant/enums/status.enum";

export class CreateAuditLogDto {
  @ApiProperty({ enum: AuditEvent, example: AuditEvent.PATIENT_RECORD_UPDATE })
  @IsNotEmpty()
  @IsEnum(AuditEvent)
  action: AuditEvent;

  @ApiProperty({ example: "Patient" })
  @IsNotEmpty()
  @IsString()
  entityType: string;

  @ApiProperty({ example: "64e7c3b2f1a2b3c4d5e6f7a8" })
  @IsNotEmpty()
  @IsMongoId()
  entityId: string;

  @ApiPropertyOptional({ example: { phone: "+8801700000000" } })
  @IsOptional()
  previousValue?: any;

  @ApiPropertyOptional({ example: { phone: "+8801711111111" } })
  @IsOptional()
  newValue?: any;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7a9" })
  @IsOptional()
  @IsMongoId()
  clinic?: string;
}

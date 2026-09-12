import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateMedicationAdminDto {
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
  prescription?: string;

  @ApiProperty({ example: "Inj. Ceftriaxone" })
  @IsNotEmpty()
  @IsString()
  medicineName: string;

  @ApiProperty({ example: "1g" })
  @IsNotEmpty()
  @IsString()
  dose: string;

  @ApiProperty({ example: "IV", default: "Oral" })
  @IsNotEmpty()
  @IsString()
  route: string;

  @ApiProperty({ example: "2026-09-15T08:00:00.000Z" })
  @IsNotEmpty()
  @IsDateString()
  scheduledTime: string;

  @ApiPropertyOptional({ example: "Administer slowly over 30 minutes in 100ml NS" })
  @IsOptional()
  @IsString()
  notes?: string;
}

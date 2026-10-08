import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import {
  CommissionStatus,
  CommissionType,
} from "../../../constant/enums/status.enum";

export class CreateCommissionRecordDto {
  @ApiProperty({ example: "64e7c3b2f1a2b3c4d5e6f7a8" })
  @IsNotEmpty()
  @IsMongoId()
  doctor: string;

  @ApiProperty({ example: "64e7c3b2f1a2b3c4d5e6f7a9" })
  @IsNotEmpty()
  @IsMongoId()
  invoice: string;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7aa" })
  @IsOptional()
  @IsMongoId()
  service?: string;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7ab" })
  @IsOptional()
  @IsMongoId()
  commissionRule?: string;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ enum: CommissionType, default: CommissionType.PERCENTAGE })
  @IsOptional()
  @IsEnum(CommissionType)
  calculationType?: CommissionType;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseAmount?: number;

  @ApiPropertyOptional({ enum: CommissionStatus, default: CommissionStatus.EARNED })
  @IsOptional()
  @IsEnum(CommissionStatus)
  status?: CommissionStatus;

  @ApiPropertyOptional({ example: "OPD Consultation Commission" })
  @IsOptional()
  @IsString()
  notes?: string;
}

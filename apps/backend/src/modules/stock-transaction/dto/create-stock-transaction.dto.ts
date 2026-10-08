import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import {
  StockTransactionType,
  SupplySource,
} from "../../../constant/enums/status.enum";

export class CreateStockTransactionDto {
  @ApiProperty({ example: "64e7c3b2f1a2b3c4d5e6f7a8" })
  @IsNotEmpty()
  @IsMongoId()
  item: string;

  @ApiProperty({
    enum: StockTransactionType,
    example: StockTransactionType.PURCHASE,
  })
  @IsNotEmpty()
  @IsEnum(StockTransactionType)
  transactionType: StockTransactionType;

  @ApiPropertyOptional({
    enum: SupplySource,
    default: SupplySource.CLINIC_STOCK,
  })
  @IsOptional()
  @IsEnum(SupplySource)
  supplySource?: SupplySource;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiPropertyOptional({ example: 8.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ example: "BATCH-2026-09A" })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ example: "2027-12-31T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ example: "Initial bulk procurement / Patient issue" })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7a9" })
  @IsOptional()
  @IsMongoId()
  patient?: string;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7aa" })
  @IsOptional()
  @IsMongoId()
  admission?: string;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7ab" })
  @IsOptional()
  @IsMongoId()
  operation?: string;
}

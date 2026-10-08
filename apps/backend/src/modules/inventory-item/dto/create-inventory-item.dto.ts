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
import { InventoryCategory } from "../../../constant/enums/status.enum";

export class CreateInventoryItemDto {
  @ApiProperty({ example: "Paracetamol 500mg" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: "Acetaminophen" })
  @IsOptional()
  @IsString()
  genericName?: string;

  @ApiProperty({
    enum: InventoryCategory,
    example: InventoryCategory.MEDICINE,
  })
  @IsNotEmpty()
  @IsEnum(InventoryCategory)
  category: InventoryCategory;

  @ApiProperty({ example: "strip", default: "pcs" })
  @IsNotEmpty()
  @IsString()
  unit: string;

  @ApiProperty({ example: 8.5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiProperty({ example: 12.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiPropertyOptional({ example: 20, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderLevel?: number;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7a8" })
  @IsOptional()
  @IsMongoId()
  supplier?: string;
}

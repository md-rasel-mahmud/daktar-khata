import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { ServiceCategory } from "../../../constant/enums/status.enum";

export class CreateServiceCatalogDto {
  @ApiProperty({ example: "General Consultation" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ServiceCategory, default: ServiceCategory.SERVICE })
  @IsNotEmpty()
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @ApiPropertyOptional({ example: "Standard OPD consultation" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 500 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  defaultPrice: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  discountEligible?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  commissionEligible?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  inventoryImpact?: boolean;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceDuration?: number;

  @ApiPropertyOptional({ example: "General Medicine" })
  @IsOptional()
  @IsString()
  department?: string;
}

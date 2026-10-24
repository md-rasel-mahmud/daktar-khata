import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class TestOrderItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  test: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  testName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateTestOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  patient: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  doctor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referringDoctorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isWalkIn?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  merchant?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  encounter?: string;

  @ApiProperty({ type: [TestOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestOrderItemDto)
  items: TestOrderItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({ example: "FIXED", enum: ["FIXED", "PERCENTAGE"] })
  @IsOptional()
  @IsString()
  discountType?: "FIXED" | "PERCENTAGE";

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentStatus?: string;
}

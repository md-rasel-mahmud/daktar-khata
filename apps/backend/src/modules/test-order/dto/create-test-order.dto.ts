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

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  doctor: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  encounter?: string;

  @ApiProperty({ type: [TestOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestOrderItemDto)
  items: TestOrderItemDto[];
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateLabReportDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  testOrder: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  testOrderItemIndex: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  patient: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  findings?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conclusion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

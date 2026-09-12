import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class RecordRefundDto {
  @ApiProperty({ example: 500 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: "Service cancelled by patient" })
  @IsOptional()
  @IsString()
  reason?: string;
}

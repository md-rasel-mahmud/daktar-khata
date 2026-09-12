import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class RecordPaymentDto {
  @ApiProperty({ example: 1000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: "CASH", default: "CASH" })
  @IsNotEmpty()
  @IsString()
  method: string;

  @ApiPropertyOptional({ example: "TRX-98765" })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ example: "Partial cash payment at counter" })
  @IsOptional()
  @IsString()
  note?: string;
}

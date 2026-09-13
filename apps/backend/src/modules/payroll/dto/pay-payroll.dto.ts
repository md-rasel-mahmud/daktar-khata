import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class PayPayrollDto {
  @ApiPropertyOptional({ example: "BANK_TRANSFER", default: "CASH" })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: "TRX-SALARY-2026-09-001" })
  @IsOptional()
  @IsString()
  transactionReference?: string;

  @ApiPropertyOptional({ example: "Paid via Dutch Bangla Bank corporate account" })
  @IsOptional()
  @IsString()
  notes?: string;
}

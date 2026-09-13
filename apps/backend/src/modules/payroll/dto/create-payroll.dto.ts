import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from "class-validator";
import {
  PayrollStatus,
  SalaryType,
} from "src/constant/enums/status.enum";

export class CreatePayrollDto {
  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7a8" })
  @IsOptional()
  @IsMongoId()
  staff?: string;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7a9" })
  @IsOptional()
  @IsMongoId()
  doctor?: string;

  @ApiProperty({ example: "Rahim Uddin" })
  @IsNotEmpty()
  @IsString()
  recipientName: string;

  @ApiProperty({ example: "NURSE" })
  @IsNotEmpty()
  @IsString()
  recipientRole: string;

  @ApiProperty({ example: "2026-09" })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: "billingCycle must be in YYYY-MM format (e.g. 2026-09)",
  })
  billingCycle: string;

  @ApiPropertyOptional({ enum: SalaryType, default: SalaryType.MONTHLY })
  @IsOptional()
  @IsEnum(SalaryType)
  salaryType?: SalaryType;

  @ApiProperty({ example: 25000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @ApiPropertyOptional({ example: 26, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  attendanceDays?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  attendanceAdjustment?: number;

  @ApiPropertyOptional({ example: 1500, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  overtime?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  commission?: number;

  @ApiPropertyOptional({ example: 2000, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @ApiPropertyOptional({ example: 500, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deduction?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  advance?: number;

  @ApiPropertyOptional({ enum: PayrollStatus, default: PayrollStatus.DRAFT })
  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;

  @ApiPropertyOptional({ example: "Overtime for night shifts" })
  @IsOptional()
  @IsString()
  notes?: string;
}

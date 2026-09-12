import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { ServiceCategory } from "src/constant/enums/status.enum";

export class LineItemInputDto {
  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7a8" })
  @IsOptional()
  @IsMongoId()
  service?: string;

  @ApiProperty({ example: "OPD Consultation" })
  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @ApiPropertyOptional({ enum: ServiceCategory })
  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @ApiProperty({ example: 1, default: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 500 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;
}

export class InitialPaymentDto {
  @ApiProperty({ example: 500 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: "CASH", default: "CASH" })
  @IsNotEmpty()
  @IsString()
  method: string;

  @ApiPropertyOptional({ example: "TRX-12345" })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ example: "Advance payment" })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: "64e7c3b2f1a2b3c4d5e6f7a8" })
  @IsNotEmpty()
  @IsMongoId()
  patient: string;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7a9" })
  @IsOptional()
  @IsMongoId()
  doctor?: string;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7aa" })
  @IsOptional()
  @IsMongoId()
  admission?: string;

  @ApiPropertyOptional({ example: "64e7c3b2f1a2b3c4d5e6f7ab" })
  @IsOptional()
  @IsMongoId()
  appointment?: string;

  @ApiPropertyOptional({ example: "2026-09-30T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: "Special discount for OPD patient" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  invoiceDiscount?: number;

  @ApiProperty({ type: [LineItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemInputDto)
  lineItems: LineItemInputDto[];

  @ApiPropertyOptional({ type: InitialPaymentDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InitialPaymentDto)
  initialPayment?: InitialPaymentDto;
}

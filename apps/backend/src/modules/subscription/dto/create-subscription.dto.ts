import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
} from "class-validator";
import { ActiveInactiveStatus } from "../../../constant/enums/status.enum";

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  planName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsNotEmpty()
  @IsNumber()
  monthlyPrice: number;

  @IsNotEmpty()
  @IsNumber()
  halfYearlyPrice: number;

  @IsNotEmpty()
  @IsNumber()
  yearlyPrice: number;

  @IsOptional()
  @IsNumber()
  doctorLimit?: number = 5;

  @IsOptional()
  @IsNumber()
  patientLimit?: number = 1000;

  @IsOptional()
  @IsNumber()
  staffLimit?: number = 10;

  @IsOptional()
  @IsString()
  billingCycle?: string = "monthly";

  @IsOptional()
  @IsNumber()
  durationInDays?: number = 30;

  @IsOptional()
  @IsEnum(ActiveInactiveStatus)
  status?: ActiveInactiveStatus = ActiveInactiveStatus.ACTIVE;
}

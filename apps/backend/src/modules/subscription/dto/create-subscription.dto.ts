import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
} from "class-validator";
import { ActiveInactiveStatus } from "src/constant/enums/status.enum";

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  planName: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  durationInDays?: number;

  @IsOptional()
  @IsString()
  @IsEnum(Object.values(ActiveInactiveStatus))
  status?: string;
}

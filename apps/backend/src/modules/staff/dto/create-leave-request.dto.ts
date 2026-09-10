import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateLeaveRequestDto {
  @IsNotEmpty()
  @IsDateString()
  fromDate: string;

  @IsNotEmpty()
  @IsDateString()
  toDate: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}

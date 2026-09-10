import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { AttendanceStatusEnum } from "src/constant/enums/staff-role.enum";

export class RecordAttendanceDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsEnum(AttendanceStatusEnum)
  status?: AttendanceStatusEnum;
}

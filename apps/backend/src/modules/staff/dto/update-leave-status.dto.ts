import { IsEnum, IsOptional, IsString } from "class-validator";
import { LeaveStatusEnum } from "../../../constant/enums/staff-role.enum";

export class UpdateLeaveStatusDto {
  @IsEnum(LeaveStatusEnum)
  status: LeaveStatusEnum;

  @IsOptional()
  @IsString()
  remarks?: string;
}

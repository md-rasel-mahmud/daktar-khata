import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { StaffRoleEnum } from "src/constant/enums/staff-role.enum";

export class CreateStaffRoleTemplateDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(StaffRoleEnum)
  staffRole: StaffRoleEnum;

  @IsOptional()
  @IsString()
  customRoleName?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissions: string[];

  @IsOptional()
  @IsString()
  description?: string;
}

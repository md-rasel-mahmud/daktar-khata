import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";
import { RolesEnum } from "../../../constant";
import { StaffRoleEnum } from "../../../constant/enums/staff-role.enum";

export class CreateStaffDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  @IsEnum(RolesEnum)
  role?: RolesEnum;

  @IsOptional()
  @IsString()
  @IsEnum(StaffRoleEnum)
  staffRole?: StaffRoleEnum;

  @IsOptional()
  @IsString()
  customRoleName?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  leaveBalance?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsMongoId()
  clinicId?: string;
}

import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { RolesEnum } from "src/constant";

export class CreateUserDto {
  @IsMobilePhone()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email?: string;

  @IsEnum(RolesEnum)
  @IsOptional()
  role?: RolesEnum;
}

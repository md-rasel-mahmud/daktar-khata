import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMobilePhone,
  IsEnum,
} from "class-validator";
import { Gender, Status } from "src/constant";

export class PersonDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsMobilePhone()
  @IsOptional()
  mobile?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;
}

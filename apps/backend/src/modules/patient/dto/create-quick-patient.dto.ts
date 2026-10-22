import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateQuickPatientDto {
  @ApiProperty({ example: "Md. Karim Rahman" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: "01712345678" })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: "MALE" })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: "O+" })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional({ example: "Dhaka, Bangladesh" })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: "35" })
  @IsOptional()
  age?: string | number;

  @ApiPropertyOptional({ example: "01812345678" })
  @IsOptional()
  @IsString()
  emergencyContact?: string;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSupplierDto {
  @ApiProperty({ example: "Square Pharmaceuticals Ltd." })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: "Mr. Rafiqul Islam" })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({ example: "+8801712345678" })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: "supply@squarepharma.com" })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: "Uttara, Dhaka - 1230" })
  @IsOptional()
  @IsString()
  address?: string;
}

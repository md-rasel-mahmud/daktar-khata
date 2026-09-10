import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateClinicDto {
  @ApiProperty({
    description: "Name of the clinic",
    example: "Medicare Diagnostic Center",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: "Address of the clinic",
    example: "House #12, Road #5, Rajshahi, Bangladesh",
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: "URL of the clinic logo",
    example: "https://example.com/uploads/clinic-logo.png",
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({
    description: "Contact number of the clinic",
    example: "+8801712345678",
  })
  @IsOptional()
  @IsString()
  contactNumber?: string;
}

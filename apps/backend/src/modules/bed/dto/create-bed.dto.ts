import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBedDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bedNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  room: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  ward: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

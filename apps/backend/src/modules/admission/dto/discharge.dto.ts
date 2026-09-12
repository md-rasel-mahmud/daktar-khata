import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class DischargeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dischargeNotes?: string;
}

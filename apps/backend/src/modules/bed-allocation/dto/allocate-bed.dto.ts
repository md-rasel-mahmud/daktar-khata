import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsOptional } from "class-validator";

export class AllocateBedDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  bed: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  patient: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  admission?: string;
}

export class TransferBedDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  newBed: string;
}

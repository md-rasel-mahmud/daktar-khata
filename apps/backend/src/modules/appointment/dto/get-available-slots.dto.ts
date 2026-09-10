import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from "class-validator";

export class GetAvailableSlotsDto {
  @ApiProperty({
    description: "Doctor ID",
    example: "652f9f18c1b2a4a7b8f67890",
  })
  @IsNotEmpty()
  @IsMongoId()
  doctorId: string;

  @ApiProperty({
    description: "Start date for slot retrieval (ISO format)",
    example: "2025-10-20T00:00:00.000Z",
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: "End date for slot retrieval (ISO format)",
    example: "2025-10-27T00:00:00.000Z",
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: "Slot duration in minutes (default: 30)",
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  slotDuration?: number;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CommissionStatus } from "../../../constant/enums/status.enum";

export class UpdateCommissionStatusDto {
  @ApiProperty({ enum: CommissionStatus, example: CommissionStatus.SETTLED })
  @IsNotEmpty()
  @IsEnum(CommissionStatus)
  status: CommissionStatus;

  @ApiPropertyOptional({ example: "Settled via bank transfer #BT98231" })
  @IsOptional()
  @IsString()
  notes?: string;
}

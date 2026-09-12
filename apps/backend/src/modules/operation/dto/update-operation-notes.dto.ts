import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString } from "class-validator";

export class UpdateOperationNotesDto {
  @ApiPropertyOptional({ example: "Inflamed retrocecal appendix with mild adhesions." })
  @IsOptional()
  @IsString()
  findings?: string;

  @ApiPropertyOptional({ example: "3-port laparoscopic appendectomy performed uneventfully." })
  @IsOptional()
  @IsString()
  procedureDetails?: string;

  @ApiPropertyOptional({ example: "None. Minimal blood loss (<20ml)." })
  @IsOptional()
  @IsString()
  complications?: string;

  @ApiPropertyOptional({ example: "NPO for 6 hours, IV fluids, analgesia as charted." })
  @IsOptional()
  @IsString()
  postOpInstructions?: string;

  @ApiPropertyOptional({ example: "Suture removal after 7 days in OPD." })
  @IsOptional()
  @IsString()
  followUpPlan?: string;

  @ApiPropertyOptional({ example: "2026-09-15T09:15:00.000Z" })
  @IsOptional()
  @IsDateString()
  actualStartTime?: string;

  @ApiPropertyOptional({ example: "2026-09-15T10:45:00.000Z" })
  @IsOptional()
  @IsDateString()
  actualEndTime?: string;
}

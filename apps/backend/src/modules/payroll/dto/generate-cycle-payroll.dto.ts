import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class GenerateCyclePayrollDto {
  @ApiProperty({
    example: "2026-09",
    description: "Billing cycle in YYYY-MM format",
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: "billingCycle must be in YYYY-MM format (e.g. 2026-09)",
  })
  billingCycle: string;
}

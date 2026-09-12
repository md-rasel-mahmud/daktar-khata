import { PartialType } from "@nestjs/swagger";
import { CreateDischargeSummaryDto } from "./create-discharge-summary.dto";

export class UpdateDischargeSummaryDto extends PartialType(
  CreateDischargeSummaryDto,
) {}

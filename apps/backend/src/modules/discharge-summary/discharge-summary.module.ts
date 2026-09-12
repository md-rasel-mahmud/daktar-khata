import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DischargeSummaryService } from "./discharge-summary.service";
import { DischargeSummaryController } from "./discharge-summary.controller";
import {
  DischargeSummary,
  DischargeSummarySchema,
} from "./schema/discharge-summary.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: collectionsName.dischargeSummary,
        schema: DischargeSummarySchema,
      },
    ]),
  ],
  controllers: [DischargeSummaryController],
  providers: [DischargeSummaryService],
  exports: [DischargeSummaryService],
})
export class DischargeSummaryModule {}

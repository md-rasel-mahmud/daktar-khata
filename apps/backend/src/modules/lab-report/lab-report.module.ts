import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LabReportService } from "./lab-report.service";
import { LabReportController } from "./lab-report.controller";
import { LabReportSchema } from "./schema/lab-report.schema";
import { collectionsName } from "../../constant";
import { TestOrderModule } from "../test-order/test-order.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.labReport, schema: LabReportSchema },
    ]),
    TestOrderModule,
  ],
  controllers: [LabReportController],
  providers: [LabReportService],
  exports: [LabReportService],
})
export class LabReportModule {}

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CommissionRecordService } from "./commission-record.service";
import { CommissionRecordController } from "./commission-record.controller";
import {
  CommissionRecord,
  CommissionRecordSchema,
} from "./schema/commission-record.schema";
import { Invoice, InvoiceSchema } from "../invoice/schema/invoice.schema";
import {
  CommissionRule,
  CommissionRuleSchema,
} from "../commission-rule/schema/commission-rule.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.commissionRecord, schema: CommissionRecordSchema },
      { name: collectionsName.invoice, schema: InvoiceSchema },
      { name: collectionsName.commissionRule, schema: CommissionRuleSchema },
    ]),
  ],
  controllers: [CommissionRecordController],
  providers: [CommissionRecordService],
  exports: [CommissionRecordService],
})
export class CommissionRecordModule {}

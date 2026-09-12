import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CommissionRuleService } from "./commission-rule.service";
import { CommissionRuleController } from "./commission-rule.controller";
import {
  CommissionRule,
  CommissionRuleSchema,
} from "./schema/commission-rule.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.commissionRule, schema: CommissionRuleSchema },
    ]),
  ],
  controllers: [CommissionRuleController],
  providers: [CommissionRuleService],
  exports: [CommissionRuleService],
})
export class CommissionRuleModule {}

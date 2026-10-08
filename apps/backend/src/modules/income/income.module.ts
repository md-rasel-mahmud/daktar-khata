import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { collectionsName } from "../../constant";
import { IncomeController } from "./income.controller";
import { IncomeService } from "./income.service";
import { IncomeSchema } from "./schema/income.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.income, schema: IncomeSchema },
    ]),
  ],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [IncomeService, MongooseModule],
})
export class IncomeModule {}

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { collectionsName } from "../../constant";
import { ExpenseSchema } from "../expense/schema/expense.schema";
import { IncomeSchema } from "../income/schema/income.schema";
import { FinanceController } from "./finance.controller";
import { FinanceService } from "./finance.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.income, schema: IncomeSchema },
      { name: collectionsName.expense, schema: ExpenseSchema },
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}

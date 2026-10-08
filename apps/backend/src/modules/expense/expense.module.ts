import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { collectionsName } from "../../constant";
import { ExpenseController } from "./expense.controller";
import { ExpenseService } from "./expense.service";
import { ExpenseSchema } from "./schema/expense.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.expense, schema: ExpenseSchema },
    ]),
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService, MongooseModule],
})
export class ExpenseModule {}

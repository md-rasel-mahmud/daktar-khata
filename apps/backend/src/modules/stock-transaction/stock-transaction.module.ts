import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StockTransactionService } from "./stock-transaction.service";
import { StockTransactionController } from "./stock-transaction.controller";
import {
  StockTransaction,
  StockTransactionSchema,
} from "./schema/stock-transaction.schema";
import {
  InventoryItem,
  InventoryItemSchema,
} from "../inventory-item/schema/inventory-item.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: collectionsName.stockTransaction,
        schema: StockTransactionSchema,
      },
      {
        name: collectionsName.inventoryItem,
        schema: InventoryItemSchema,
      },
    ]),
  ],
  controllers: [StockTransactionController],
  providers: [StockTransactionService],
  exports: [StockTransactionService],
})
export class StockTransactionModule {}

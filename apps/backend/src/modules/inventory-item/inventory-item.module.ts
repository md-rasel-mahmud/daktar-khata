import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { InventoryItemService } from "./inventory-item.service";
import { InventoryItemController } from "./inventory-item.controller";
import {
  InventoryItem,
  InventoryItemSchema,
} from "./schema/inventory-item.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.inventoryItem, schema: InventoryItemSchema },
    ]),
  ],
  controllers: [InventoryItemController],
  providers: [InventoryItemService],
  exports: [InventoryItemService],
})
export class InventoryItemModule {}

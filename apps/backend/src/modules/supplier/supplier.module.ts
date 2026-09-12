import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SupplierService } from "./supplier.service";
import { SupplierController } from "./supplier.controller";
import { Supplier, SupplierSchema } from "./schema/supplier.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.supplier, schema: SupplierSchema },
    ]),
  ],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}

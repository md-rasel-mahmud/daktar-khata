import { Module } from "@nestjs/common";
import { MerchantService } from "./merchant.service";
import { MerchantController } from "./merchant.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { MerchantSchema } from "./schema/merchant.schema";
import { collectionsName } from "src/constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.merchant, schema: MerchantSchema },
    ]),
  ],
  controllers: [MerchantController],
  providers: [MerchantService],
  exports: [MerchantService, MongooseModule],
})
export class MerchantModule {}

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MerchantPGService } from "./merchant-pg.service";
import { MerchantPGController } from "./merchant-pg.controller";
import { collectionsName } from "../../constant";
import { MerchantPGSchema } from "./schema/merchant-pg.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.merchantPG, schema: MerchantPGSchema },
    ]),
  ],
  controllers: [MerchantPGController],
  providers: [MerchantPGService],
  exports: [MerchantPGService],
})
export class MerchantPGModule {}

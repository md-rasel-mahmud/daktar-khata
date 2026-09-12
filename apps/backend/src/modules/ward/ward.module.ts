import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WardService } from "./ward.service";
import { WardController } from "./ward.controller";
import { WardSchema } from "./schema/ward.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.ward, schema: WardSchema },
    ]),
  ],
  controllers: [WardController],
  providers: [WardService],
  exports: [WardService],
})
export class WardModule {}

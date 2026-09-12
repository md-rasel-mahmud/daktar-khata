import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BedService } from "./bed.service";
import { BedController } from "./bed.controller";
import { BedSchema } from "./schema/bed.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.bed, schema: BedSchema },
    ]),
  ],
  controllers: [BedController],
  providers: [BedService],
  exports: [BedService],
})
export class BedModule {}

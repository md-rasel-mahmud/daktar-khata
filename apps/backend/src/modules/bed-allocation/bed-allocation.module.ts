import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BedAllocationService } from "./bed-allocation.service";
import { BedAllocationController } from "./bed-allocation.controller";
import { BedAllocationSchema } from "./schema/bed-allocation.schema";
import { BedSchema } from "../bed/schema/bed.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.bedAllocation, schema: BedAllocationSchema },
      { name: collectionsName.bed, schema: BedSchema },
    ]),
  ],
  controllers: [BedAllocationController],
  providers: [BedAllocationService],
  exports: [BedAllocationService],
})
export class BedAllocationModule {}

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TestOrderService } from "./test-order.service";
import { TestOrderController } from "./test-order.controller";
import { TestOrderSchema } from "./schema/test-order.schema";
import { collectionsName } from "../../constant";
import { DoctorModule } from "../doctor/doctor.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.testOrder, schema: TestOrderSchema },
    ]),
    DoctorModule,
  ],
  controllers: [TestOrderController],
  providers: [TestOrderService],
  exports: [TestOrderService],
})
export class TestOrderModule {}

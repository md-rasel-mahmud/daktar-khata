import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.patient, schema: {} as any },
      { name: collectionsName.doctor, schema: {} as any },
      { name: collectionsName.staff, schema: {} as any },
      { name: collectionsName.subscription, schema: {} as any },
      { name: collectionsName.payment, schema: {} as any },
      { name: collectionsName.merchant, schema: {} as any },
    ]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}

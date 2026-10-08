import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SubscriptionService } from "./subscription.service";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionSchema } from "./subscription.schema";
import { collectionsName } from "../../constant";
import { SubscriptionScheduler } from "./subscription.scheduler";
import { MerchantModule } from "../merchant/merchant.module";

import { PaymentSchema } from "../payment/payment.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.subscription, schema: SubscriptionSchema },
      { name: collectionsName.payment, schema: PaymentSchema },
    ]),
    MerchantModule,
  ],
  providers: [SubscriptionService, SubscriptionScheduler],
  controllers: [SubscriptionController],
  exports: [SubscriptionService, MongooseModule],
})
export class SubscriptionModule {}

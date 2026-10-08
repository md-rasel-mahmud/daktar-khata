import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PaymentService } from "./payment.service";
import { SubscriptionModule } from "../subscription/subscription.module";
import { PaymentController } from "./payment.controller";
import { PaymentSchema } from "./payment.schema";
import { collectionsName } from "../../constant";
import { MerchantModule } from "../merchant/merchant.module";
import { MerchantPGModule } from "../merchant-pg/merchant-pg.module";
import { AppointmentModule } from "../appointment/appointment.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.payment, schema: PaymentSchema },
    ]),
    SubscriptionModule,
    MerchantModule,
    MerchantPGModule,
    AppointmentModule,
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}

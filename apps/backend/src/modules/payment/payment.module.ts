import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PaymentService } from "./payment.service";
import { SubscriptionModule } from "../subscription/subscription.module";
import { PaymentController } from "./payment.controller";
import { PaymentSchema } from "./payment.schema";
import { collectionsName } from "../../constant";
import { MerchantModule } from "src/modules/merchant/merchant.module";
import { MerchantPGModule } from "src/modules/merchant-pg/merchant-pg.module";
import { AppointmentModule } from "src/modules/appointment/appointment.module";

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

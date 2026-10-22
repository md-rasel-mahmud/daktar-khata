import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppointmentService } from "./appointment.service";
import { AppointmentController } from "./appointment.controller";
import { AppointmentQueueService } from "./appointment-queue.service";
import { AppointmentQueueController } from "./appointment-queue.controller";
import { AppointmentSchema } from "./schema/appointment.schema";
import { collectionsName } from "../../constant";
import { PaymentModule } from "../payment/payment.module";
import { PatientModule } from "../patient/patient.module";
import { DoctorModule } from "../doctor/doctor.module";
import { MerchantModule } from "../merchant/merchant.module";
import { MerchantPGModule } from "../merchant-pg/merchant-pg.module";
import { QueueModule } from "../queue/queue.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.appointment, schema: AppointmentSchema },
    ]),
    forwardRef(() => PaymentModule),
    PatientModule,
    DoctorModule,
    MerchantModule,
    MerchantPGModule,
    QueueModule,
  ],
  controllers: [AppointmentController, AppointmentQueueController],
  providers: [AppointmentService, AppointmentQueueService],
  exports: [AppointmentService, AppointmentQueueService],
})
export class AppointmentModule {}

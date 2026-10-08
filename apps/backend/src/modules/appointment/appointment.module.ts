import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppointmentService } from "./appointment.service";
import { AppointmentController } from "./appointment.controller";
import { AppointmentSchema } from "./schema/appointment.schema";
import { collectionsName } from "../../constant";
import { PaymentModule } from "../payment/payment.module";
import { PatientModule } from "../patient/patient.module";
import { DoctorModule } from "../doctor/doctor.module";
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
    MerchantPGModule,
    QueueModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}

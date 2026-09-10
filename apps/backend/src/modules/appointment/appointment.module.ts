import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppointmentService } from "./appointment.service";
import { AppointmentController } from "./appointment.controller";
import { AppointmentSchema } from "./schema/appointment.schema";
import { collectionsName } from "../../constant";
import { PaymentModule } from "src/modules/payment/payment.module";
import { PatientModule } from "src/modules/patient/patient.module";
import { DoctorModule } from "src/modules/doctor/doctor.module";
import { MerchantPGModule } from "src/modules/merchant-pg/merchant-pg.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.appointment, schema: AppointmentSchema },
    ]),
    forwardRef(() => PaymentModule),
    PatientModule,
    DoctorModule,
    MerchantPGModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}

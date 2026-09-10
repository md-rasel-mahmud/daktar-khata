import { Module } from "@nestjs/common";

import { PatientController } from "./patient.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { PatientSchema } from "./schema/patient.schema";
import { collectionsName } from "src/constant";
import { PatientService } from "src/modules/patient/patient.service";
import { AppointmentSchema } from "src/modules/appointment/schema/appointment.schema";
import { DoctorSchema } from "src/modules/doctor/schema/doctor.schema";
import { MedicalRecordModule } from "src/modules/medical-records/medical-record.module";

@Module({
  imports: [
    MedicalRecordModule,
    MongooseModule.forFeature([
      { name: collectionsName.patient, schema: PatientSchema },
      { name: collectionsName.appointment, schema: AppointmentSchema },
      { name: collectionsName.doctor, schema: DoctorSchema },
    ]),
  ],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService, MongooseModule],
})
export class PatientModule {}

import { Module } from "@nestjs/common";

import { PatientController } from "./patient.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { PatientSchema } from "./schema/patient.schema";
import { collectionsName } from "../../constant";
import { PatientService } from "./patient.service";
import { AppointmentSchema } from "../appointment/schema/appointment.schema";
import { DoctorSchema } from "../doctor/schema/doctor.schema";
import { MedicalRecordModule } from "../medical-records/medical-record.module";

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

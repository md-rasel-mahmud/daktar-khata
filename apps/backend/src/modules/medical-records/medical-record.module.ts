import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { collectionsName } from "../../constant";
import { PatientSchema } from "../patient/schema/patient.schema";
import { DoctorSchema } from "../doctor/schema/doctor.schema";
import { MedicalRecordController } from "./medical-record.controller";
import { MedicalRecordService } from "./medical-record.service";
import { MedicalRecordSchema } from "./schema/medical-record.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.medicalRecord, schema: MedicalRecordSchema },
      { name: collectionsName.patient, schema: PatientSchema },
      { name: collectionsName.doctor, schema: DoctorSchema },
    ]),
  ],
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService],
  exports: [MedicalRecordService, MongooseModule],
})
export class MedicalRecordModule {}

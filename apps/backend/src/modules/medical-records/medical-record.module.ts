import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { collectionsName } from "src/constant";
import { PatientSchema } from "src/modules/patient/schema/patient.schema";
import { DoctorSchema } from "src/modules/doctor/schema/doctor.schema";
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

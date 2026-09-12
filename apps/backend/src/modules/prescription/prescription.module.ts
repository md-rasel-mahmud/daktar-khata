import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PrescriptionService } from "./prescription.service";
import { PrescriptionController } from "./prescription.controller";
import { PrescriptionSchema } from "./schema/prescription.schema";
import { collectionsName } from "../../constant";
import { DoctorModule } from "../doctor/doctor.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.prescription, schema: PrescriptionSchema },
    ]),
    DoctorModule,
  ],
  controllers: [PrescriptionController],
  providers: [PrescriptionService],
  exports: [PrescriptionService],
})
export class PrescriptionModule {}

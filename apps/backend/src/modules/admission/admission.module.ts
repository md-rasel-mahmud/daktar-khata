import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdmissionService } from "./admission.service";
import { AdmissionController } from "./admission.controller";
import { AdmissionSchema } from "./schema/admission.schema";
import { BedSchema } from "../bed/schema/bed.schema";
import { BedAllocationSchema } from "../bed-allocation/schema/bed-allocation.schema";
import { collectionsName } from "../../constant";
import { DoctorModule } from "../doctor/doctor.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.admission, schema: AdmissionSchema },
      { name: collectionsName.bed, schema: BedSchema },
      { name: collectionsName.bedAllocation, schema: BedAllocationSchema },
    ]),
    DoctorModule,
  ],
  controllers: [AdmissionController],
  providers: [AdmissionService],
  exports: [AdmissionService],
})
export class AdmissionModule {}

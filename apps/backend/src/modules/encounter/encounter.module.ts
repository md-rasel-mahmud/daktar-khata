import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EncounterService } from "./encounter.service";
import { EncounterController } from "./encounter.controller";
import { EncounterSchema } from "./schema/encounter.schema";
import { collectionsName } from "../../constant";
import { DoctorModule } from "../doctor/doctor.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.encounter, schema: EncounterSchema },
    ]),
    DoctorModule,
  ],
  controllers: [EncounterController],
  providers: [EncounterService],
  exports: [EncounterService],
})
export class EncounterModule {}

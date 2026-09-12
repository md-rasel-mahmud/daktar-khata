import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MedicationAdministrationService } from "./medication-administration.service";
import { MedicationAdministrationController } from "./medication-administration.controller";
import {
  MedicationAdministration,
  MedicationAdministrationSchema,
} from "./schema/medication-administration.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: collectionsName.medicationAdministration,
        schema: MedicationAdministrationSchema,
      },
    ]),
  ],
  controllers: [MedicationAdministrationController],
  providers: [MedicationAdministrationService],
  exports: [MedicationAdministrationService],
})
export class MedicationAdministrationModule {}

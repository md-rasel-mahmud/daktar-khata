import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClinicService } from "./clinic.service";
import { ClinicController } from "./clinic.controller";
import { clinicsSchema } from "./schema/clinic.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.clinic, schema: clinicsSchema },
    ]),
  ],
  controllers: [ClinicController],
  providers: [ClinicService],
  exports: [ClinicService],
})
export class ClinicModule {}

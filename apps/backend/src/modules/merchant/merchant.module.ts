import { Module } from "@nestjs/common";
import { MerchantService } from "./merchant.service";
import { MerchantController } from "./merchant.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { MerchantSchema } from "./schema/merchant.schema";
import { collectionsName } from "../../constant";

import { UserSchema } from "../user/schema/user.schema";
import { DoctorSchema } from "../doctor/schema/doctor.schema";
import { PatientSchema } from "../patient/schema/patient.schema";
import { StaffSchema } from "../staff/schema/staff.schema";
import { SubscriptionSchema } from "../subscription/subscription.schema";
import { clinicsSchema } from "../clinic/schema/clinic.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.merchant, schema: MerchantSchema },
      { name: collectionsName.user, schema: UserSchema },
      { name: collectionsName.doctor, schema: DoctorSchema },
      { name: collectionsName.patient, schema: PatientSchema },
      { name: collectionsName.staff, schema: StaffSchema },
      { name: collectionsName.subscription, schema: SubscriptionSchema },
      { name: collectionsName.clinic, schema: clinicsSchema },
    ]),
  ],
  controllers: [MerchantController],
  providers: [MerchantService],
  exports: [MerchantService, MongooseModule],
})
export class MerchantModule {}

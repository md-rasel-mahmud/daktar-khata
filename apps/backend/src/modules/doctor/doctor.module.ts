import { forwardRef, Module } from "@nestjs/common";
import { DoctorService } from "./doctor.service";
import { DoctorController } from "./doctor.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { DoctorSchema } from "./schema/doctor.schema";
import { collectionsName } from "../../constant";
import { UserModule } from "../user/user.module";

import { MerchantModule } from "../merchant/merchant.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.doctor, schema: DoctorSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => MerchantModule),
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports: [DoctorService, MongooseModule],
})
export class DoctorModule {}

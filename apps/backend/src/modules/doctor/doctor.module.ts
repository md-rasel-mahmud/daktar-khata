import { forwardRef, Module } from "@nestjs/common";
import { DoctorService } from "./doctor.service";
import { DoctorController } from "./doctor.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { DoctorSchema } from "./schema/doctor.schema";
import { collectionsName } from "src/constant";
import { UserModule } from "src/modules/user/user.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.doctor, schema: DoctorSchema },
    ]),
    forwardRef(() => UserModule),
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports: [DoctorService, MongooseModule],
})
export class DoctorModule {}

import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StaffService } from "./staff.service";
import { StaffController } from "./staff.controller";
import { UserModule } from "../../modules/user/user.module";
import { collectionsName } from "../../constant";
import { StaffSchema } from "./schema/staff.schema";
import { AttendanceSchema } from "./schema/attendance.schema";

@Module({
  imports: [
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      { name: collectionsName.staff, schema: StaffSchema },
      { name: collectionsName.attendance, schema: AttendanceSchema },
    ]),
  ],
  providers: [StaffService],
  controllers: [StaffController],
  exports: [StaffService, MongooseModule],
})
export class StaffModule {}

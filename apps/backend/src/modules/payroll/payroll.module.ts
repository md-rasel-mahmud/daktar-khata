import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PayrollService } from "./payroll.service";
import { PayrollController } from "./payroll.controller";
import { Payroll, PayrollSchema } from "./schema/payroll.schema";
import { Staff, StaffSchema } from "../staff/schema/staff.schema";
import {
  Attendance,
  AttendanceSchema,
} from "../staff/schema/attendance.schema";
import {
  CommissionRecord,
  CommissionRecordSchema,
} from "../commission-record/schema/commission-record.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.payroll, schema: PayrollSchema },
      { name: collectionsName.staff, schema: StaffSchema },
      { name: collectionsName.attendance, schema: AttendanceSchema },
      {
        name: collectionsName.commissionRecord,
        schema: CommissionRecordSchema,
      },
    ]),
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}

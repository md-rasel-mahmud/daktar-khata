import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { collectionsName } from "../../constant";

import { PatientSchema } from "../patient/schema/patient.schema";
import { DoctorSchema } from "../doctor/schema/doctor.schema";
import { StaffSchema } from "../staff/schema/staff.schema";
import { AttendanceSchema } from "../staff/schema/attendance.schema";
import { AppointmentSchema } from "../appointment/schema/appointment.schema";
import { AdmissionSchema } from "../admission/schema/admission.schema";
import { BedSchema } from "../bed/schema/bed.schema";
import { InvoiceSchema } from "../invoice/schema/invoice.schema";
import { IncomeSchema } from "../income/schema/income.schema";
import { ExpenseSchema } from "../expense/schema/expense.schema";
import { TestOrderSchema } from "../test-order/schema/test-order.schema";
import { OperationCaseSchema } from "../operation/schema/operation.schema";
import { NursingTaskSchema } from "../nursing-task/schema/nursing-task.schema";
import { MedicationAdministrationSchema } from "../medication-administration/schema/medication-administration.schema";
import { InventoryItemSchema } from "../inventory-item/schema/inventory-item.schema";
import { CommissionRecordSchema } from "../commission-record/schema/commission-record.schema";
import { PayrollSchema } from "../payroll/schema/payroll.schema";
import { SubscriptionSchema } from "../subscription/subscription.schema";
import { PaymentSchema } from "../payment/payment.schema";
import { MerchantSchema } from "../merchant/schema/merchant.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.patient, schema: PatientSchema },
      { name: collectionsName.doctor, schema: DoctorSchema },
      { name: collectionsName.staff, schema: StaffSchema },
      { name: collectionsName.attendance, schema: AttendanceSchema },
      { name: collectionsName.appointment, schema: AppointmentSchema },
      { name: collectionsName.admission, schema: AdmissionSchema },
      { name: collectionsName.bed, schema: BedSchema },
      { name: collectionsName.invoice, schema: InvoiceSchema },
      { name: collectionsName.income, schema: IncomeSchema },
      { name: collectionsName.expense, schema: ExpenseSchema },
      { name: collectionsName.testOrder, schema: TestOrderSchema },
      { name: collectionsName.operationCase, schema: OperationCaseSchema },
      { name: collectionsName.nursingTask, schema: NursingTaskSchema },
      {
        name: collectionsName.medicationAdministration,
        schema: MedicationAdministrationSchema,
      },
      { name: collectionsName.inventoryItem, schema: InventoryItemSchema },
      {
        name: collectionsName.commissionRecord,
        schema: CommissionRecordSchema,
      },
      { name: collectionsName.payroll, schema: PayrollSchema },
      { name: collectionsName.subscription, schema: SubscriptionSchema },
      { name: collectionsName.payment, schema: PaymentSchema },
      { name: collectionsName.merchant, schema: MerchantSchema },
    ]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService],
})
export class DashboardModule {}

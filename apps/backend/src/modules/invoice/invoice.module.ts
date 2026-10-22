import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { InvoiceService } from "./invoice.service";
import { InvoiceController } from "./invoice.controller";
import { Invoice, InvoiceSchema } from "./schema/invoice.schema";
import { collectionsName } from "../../constant";
import { Patient, PatientSchema } from "../patient/schema/patient.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.invoice, schema: InvoiceSchema },
      { name: collectionsName.patient, schema: PatientSchema },
    ]),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}

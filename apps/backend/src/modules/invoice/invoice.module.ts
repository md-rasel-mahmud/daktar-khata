import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { InvoiceService } from "./invoice.service";
import { InvoiceController } from "./invoice.controller";
import { Invoice, InvoiceSchema } from "./schema/invoice.schema";
import { collectionsName } from "../../constant";
import { Patient, PatientSchema } from "../patient/schema/patient.schema";
import {
  Admission,
  AdmissionSchema,
} from "../admission/schema/admission.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.invoice, schema: InvoiceSchema },
      { name: collectionsName.patient, schema: PatientSchema },
      { name: collectionsName.admission, schema: AdmissionSchema },
    ]),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}

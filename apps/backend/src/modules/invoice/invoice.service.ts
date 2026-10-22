import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { InvoiceDocument } from "./schema/invoice.schema";
import { PatientDocument } from "../patient/schema/patient.schema";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { RecordPaymentDto } from "./dto/record-payment.dto";
import { RecordRefundDto } from "./dto/record-refund.dto";
import { UpdateInvoiceStatusDto } from "./dto/update-invoice-status.dto";
import { InvoiceStatus, ServiceCategory } from "../../constant/enums/status.enum";
import { AdmissionDocument } from "../admission/schema/admission.schema";

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(collectionsName.invoice)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(collectionsName.patient)
    private readonly patientModel: Model<PatientDocument>,
    @InjectModel(collectionsName.admission)
    private readonly admissionModel: Model<AdmissionDocument>,
  ) {}

  private generateInvoiceNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `INV-${timestamp}-${random}`;
  }

  async create(
    dto: CreateInvoiceDto,
    merchantId: Types.ObjectId,
    recordedById?: Types.ObjectId,
  ) {
    if (!dto.lineItems || dto.lineItems.length === 0) {
      throw new BadRequestException("At least one line item is required");
    }

    // Compute line item totals
    const processedLineItems = dto.lineItems.map((item) => {
      const discount = item.discount || 0;
      const tax = item.tax || 0;
      const total = Math.max(
        0,
        item.quantity * item.unitPrice - discount + tax,
      );
      return {
        service: item.service ? new Types.ObjectId(item.service) : null,
        serviceName: item.serviceName,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount,
        tax,
        total,
      };
    });

    const subtotal = dto.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const lineItemDiscounts = dto.lineItems.reduce(
      (sum, item) => sum + (item.discount || 0),
      0,
    );
    const invoiceDiscount = dto.invoiceDiscount || 0;
    const totalDiscount = lineItemDiscounts + invoiceDiscount;
    const totalTax = dto.lineItems.reduce(
      (sum, item) => sum + (item.tax || 0),
      0,
    );
    const grandTotal = Math.max(0, subtotal - totalDiscount + totalTax);

    let paidAmount = 0;
    const paymentHistory: any[] = [];

    if (dto.initialPayment && dto.initialPayment.amount > 0) {
      paidAmount = dto.initialPayment.amount;
      paymentHistory.push({
        amount: dto.initialPayment.amount,
        method: dto.initialPayment.method,
        transactionId: dto.initialPayment.transactionId || "",
        note: dto.initialPayment.note || "Initial payment on creation",
        date: new Date(),
        recordedBy: recordedById || null,
      });
    }

    const dueAmount = Math.max(0, grandTotal - paidAmount);

    let status = InvoiceStatus.ISSUED;
    if (dueAmount === 0 && grandTotal > 0) {
      status = InvoiceStatus.PAID;
    } else if (paidAmount > 0) {
      status = InvoiceStatus.PARTIALLY_PAID;
    }

    const invoiceNumber = this.generateInvoiceNumber();

    return this.invoiceModel.create({
      invoiceNumber,
      patient: new Types.ObjectId(dto.patient),
      doctor: dto.doctor ? new Types.ObjectId(dto.doctor) : null,
      admission: dto.admission ? new Types.ObjectId(dto.admission) : null,
      appointment: dto.appointment ? new Types.ObjectId(dto.appointment) : null,
      merchant: merchantId,
      status,
      issuedDate: new Date(),
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      notes: dto.notes || "",
      lineItems: processedLineItems,
      subtotal,
      totalDiscount,
      totalTax,
      grandTotal,
      paidAmount,
      dueAmount,
      refundAmount: 0,
      paymentHistory,
      refundHistory: [],
      isActive: true,
    });
  }

  async recordPayment(
    id: string,
    dto: RecordPaymentDto,
    recordedById?: Types.ObjectId,
  ) {
    const invoice = await this.invoiceModel.findById(new Types.ObjectId(id));
    if (!invoice || !invoice.isActive) {
      throw new NotFoundException("Invoice not found");
    }

    if (
      invoice.status === InvoiceStatus.CANCELLED ||
      invoice.status === InvoiceStatus.REFUNDED
    ) {
      throw new BadRequestException(
        `Cannot accept payments for invoice in ${invoice.status} status`,
      );
    }

    if (invoice.dueAmount <= 0) {
      throw new BadRequestException("Invoice is already fully paid");
    }

    invoice.paidAmount += dto.amount;
    invoice.dueAmount = Math.max(0, invoice.grandTotal - invoice.paidAmount);

    if (invoice.dueAmount === 0) {
      invoice.status = InvoiceStatus.PAID;
    } else {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    invoice.paymentHistory.push({
      amount: dto.amount,
      method: dto.method,
      transactionId: dto.transactionId || "",
      note: dto.note || "",
      date: new Date(),
      recordedBy: recordedById || null,
    } as any);

    return invoice.save();
  }

  async recordRefund(
    id: string,
    dto: RecordRefundDto,
    refundedById?: Types.ObjectId,
  ) {
    const invoice = await this.invoiceModel.findById(new Types.ObjectId(id));
    if (!invoice || !invoice.isActive) {
      throw new NotFoundException("Invoice not found");
    }

    const availableToRefund = invoice.paidAmount - invoice.refundAmount;
    if (dto.amount > availableToRefund) {
      throw new BadRequestException(
        `Refund amount exceeds refundable balance. Maximum refundable is ${availableToRefund}`,
      );
    }

    invoice.refundAmount += dto.amount;
    invoice.refundHistory.push({
      amount: dto.amount,
      reason: dto.reason || "",
      date: new Date(),
      refundedBy: refundedById || null,
    } as any);

    if (invoice.refundAmount >= invoice.paidAmount) {
      invoice.status = InvoiceStatus.REFUNDED;
    }

    return invoice.save();
  }

  async updateStatus(id: string, dto: UpdateInvoiceStatusDto) {
    const invoice = await this.invoiceModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { status: dto.status },
      { new: true },
    );
    if (!invoice) throw new NotFoundException("Invoice not found");
    return invoice;
  }

  async findAll(
    merchantId?: string,
    patientId?: string,
    status?: InvoiceStatus,
    search?: string,
  ) {
    const filter: any = { isActive: true };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    if (patientId) filter.patient = new Types.ObjectId(patientId);
    if (status) filter.status = status;
    if (search) {
      filter.invoiceNumber = { $regex: search, $options: "i" };
    }

    return this.invoiceModel
      .find(filter)
      .populate("patient", "name phone email")
      .populate("doctor", "name phone")
      .sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const invoice = await this.invoiceModel
      .findById(new Types.ObjectId(id))
      .populate("patient", "name phone email gender bloodGroup")
      .populate("doctor", "name phone specialization")
      .populate("lineItems.service", "name category defaultPrice")
      .populate("paymentHistory.recordedBy", "name email");

    if (!invoice) throw new NotFoundException("Invoice not found");
    return invoice;
  }

  async findByPatient(patientId: string, merchantId?: string) {
    if (!Types.ObjectId.isValid(patientId)) {
      throw new BadRequestException("Invalid patient ID");
    }

    const targetPatientId = new Types.ObjectId(patientId);
    const matchingPatients = await this.patientModel
      .find({
        $or: [{ _id: targetPatientId }, { user: targetPatientId }],
      })
      .select("_id");

    const patientIds =
      matchingPatients.length > 0
        ? matchingPatients.map((p) => p._id)
        : [targetPatientId];

    // Auto-reconcile any admission that does not have an active invoice
    try {
      const admissions = await this.admissionModel.find({
        patient: { $in: patientIds },
        ...(merchantId && Types.ObjectId.isValid(merchantId)
          ? { merchant: new Types.ObjectId(merchantId) }
          : {}),
      });

      for (const adm of admissions) {
        const existingInv = await this.invoiceModel.findOne({
          admission: adm._id,
          status: { $ne: InvoiceStatus.CANCELLED },
        });

        if (!existingInv) {
          const admissionTime = adm.admissionDate
            ? new Date(adm.admissionDate).getTime()
            : Date.now();
          const dischargeTime = adm.actualDischargeDate
            ? new Date(adm.actualDischargeDate).getTime()
            : Date.now();
          const daysStayed = Math.max(
            1,
            Math.ceil((dischargeTime - admissionTime) / (1000 * 60 * 60 * 24)),
          );
          const invoiceNumber = this.generateInvoiceNumber();

          const lineItems = [
            {
              serviceName: `Hospital Stay & Bed Charge (${daysStayed} day${daysStayed > 1 ? "s" : ""})`,
              category: ServiceCategory.BED,
              quantity: daysStayed,
              unitPrice: 500,
              discount: 0,
              tax: 0,
              total: daysStayed * 500,
            },
            {
              serviceName: "Inpatient Admission & Care Fee",
              category: ServiceCategory.ADMISSION,
              quantity: 1,
              unitPrice: 500,
              discount: 0,
              tax: 0,
              total: 500,
            },
          ];
          const subtotal = daysStayed * 500 + 500;

          await this.invoiceModel.create({
            invoiceNumber,
            patient: adm.patient,
            doctor: adm.doctor || null,
            admission: adm._id,
            merchant: adm.merchant,
            status: InvoiceStatus.ISSUED,
            issuedDate: adm.admissionDate || new Date(),
            lineItems,
            subtotal,
            totalDiscount: 0,
            totalTax: 0,
            grandTotal: subtotal,
            paidAmount: 0,
            dueAmount: subtotal,
            refundAmount: 0,
            paymentHistory: [],
            refundHistory: [],
            isActive: true,
          });
        }
      }
    } catch {
      // Do not block query on auto-reconciliation error
    }

    const filter: any = {
      patient: { $in: patientIds },
      isActive: true,
    };
    if (merchantId && Types.ObjectId.isValid(merchantId)) {
      filter.merchant = new Types.ObjectId(merchantId);
    }

    return this.invoiceModel
      .find(filter)
      .populate("patient", "name phone mobile")
      .populate("doctor", "name")
      .sort({ createdAt: -1 });
  }
}

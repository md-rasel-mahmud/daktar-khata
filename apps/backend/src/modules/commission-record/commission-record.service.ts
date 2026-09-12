import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { CommissionRecordDocument } from "./schema/commission-record.schema";
import { CreateCommissionRecordDto } from "./dto/create-commission-record.dto";
import { UpdateCommissionStatusDto } from "./dto/update-commission-status.dto";
import {
  CommissionStatus,
  CommissionType,
} from "../../constant/enums/status.enum";
import { InvoiceDocument } from "../invoice/schema/invoice.schema";
import { CommissionRuleDocument } from "../commission-rule/schema/commission-rule.schema";

@Injectable()
export class CommissionRecordService {
  constructor(
    @InjectModel(collectionsName.commissionRecord)
    private readonly commissionRecordModel: Model<CommissionRecordDocument>,
    @InjectModel(collectionsName.invoice)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(collectionsName.commissionRule)
    private readonly commissionRuleModel: Model<CommissionRuleDocument>,
  ) {}

  async create(dto: CreateCommissionRecordDto, merchantId: Types.ObjectId) {
    return this.commissionRecordModel.create({
      ...dto,
      doctor: new Types.ObjectId(dto.doctor),
      invoice: new Types.ObjectId(dto.invoice),
      service: dto.service ? new Types.ObjectId(dto.service) : null,
      commissionRule: dto.commissionRule
        ? new Types.ObjectId(dto.commissionRule)
        : null,
      merchant: merchantId,
      status: dto.status || CommissionStatus.EARNED,
      earnedAt: new Date(),
    });
  }

  async generateFromInvoice(
    invoiceId: string,
    merchantId: Types.ObjectId,
  ) {
    const invoice = await this.invoiceModel.findById(new Types.ObjectId(invoiceId));
    if (!invoice || !invoice.isActive) {
      throw new NotFoundException("Invoice not found");
    }

    if (!invoice.doctor) {
      throw new BadRequestException("No doctor associated with this invoice");
    }

    const doctorId = invoice.doctor;
    const generatedRecords: any[] = [];

    // Check doctor rules
    const doctorRules = await this.commissionRuleModel.find({
      doctor: doctorId,
      merchant: merchantId,
      isActive: true,
    });

    if (!doctorRules || doctorRules.length === 0) {
      return {
        message: "No active commission rules found for this doctor",
        records: [],
      };
    }

    // Generic rule (service: null or undefined)
    const genericRule = doctorRules.find((r) => !r.service);

    for (const item of invoice.lineItems) {
      // Find service-specific rule if service exists
      let matchedRule = item.service
        ? doctorRules.find(
            (r) => r.service && r.service.toString() === item.service!.toString(),
          )
        : null;

      if (!matchedRule) {
        matchedRule = genericRule;
      }

      if (!matchedRule || matchedRule.commissionType === CommissionType.NONE) {
        continue;
      }

      let amount = 0;
      if (matchedRule.commissionType === CommissionType.PERCENTAGE) {
        amount = Math.round(((item.total * matchedRule.commissionValue) / 100) * 100) / 100;
      } else if (matchedRule.commissionType === CommissionType.FIXED_AMOUNT) {
        amount = matchedRule.commissionValue * item.quantity;
      }

      if (amount > 0) {
        const record = await this.commissionRecordModel.create({
          doctor: doctorId,
          invoice: invoice._id,
          service: item.service || null,
          commissionRule: matchedRule._id,
          merchant: merchantId,
          amount,
          calculationType: matchedRule.commissionType,
          rate: matchedRule.commissionValue,
          baseAmount: item.total,
          status: CommissionStatus.EARNED,
          earnedAt: new Date(),
          notes: `Generated for ${item.serviceName} from invoice ${invoice.invoiceNumber}`,
          isActive: true,
        });
        generatedRecords.push(record);
      }
    }

    return {
      message: `Generated ${generatedRecords.length} commission record(s)`,
      records: generatedRecords,
    };
  }

  async updateStatus(
    id: string,
    dto: UpdateCommissionStatusDto,
    settledById?: Types.ObjectId,
  ) {
    const updatePayload: any = { status: dto.status };
    if (dto.notes) updatePayload.notes = dto.notes;

    if (dto.status === CommissionStatus.SETTLED) {
      updatePayload.settledAt = new Date();
      if (settledById) updatePayload.settledBy = settledById;
    }

    const record = await this.commissionRecordModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      updatePayload,
      { new: true },
    );
    if (!record) throw new NotFoundException("Commission record not found");
    return record;
  }

  async findAll(
    merchantId?: string,
    doctorId?: string,
    invoiceId?: string,
    status?: CommissionStatus,
  ) {
    const filter: any = { isActive: true };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    if (doctorId) filter.doctor = new Types.ObjectId(doctorId);
    if (invoiceId) filter.invoice = new Types.ObjectId(invoiceId);
    if (status) filter.status = status;

    return this.commissionRecordModel
      .find(filter)
      .populate("doctor", "name phone specialization")
      .populate("invoice", "invoiceNumber grandTotal paidAmount status")
      .populate("service", "name category defaultPrice")
      .populate("settledBy", "name email")
      .sort({ createdAt: -1 });
  }

  async findByDoctor(doctorId: string, merchantId?: string) {
    const filter: any = {
      doctor: new Types.ObjectId(doctorId),
      isActive: true,
    };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);

    return this.commissionRecordModel
      .find(filter)
      .populate("invoice", "invoiceNumber grandTotal status")
      .populate("service", "name category")
      .sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const record = await this.commissionRecordModel
      .findById(new Types.ObjectId(id))
      .populate("doctor", "name phone specialization")
      .populate("invoice", "invoiceNumber grandTotal paidAmount status")
      .populate("service", "name category defaultPrice")
      .populate("commissionRule")
      .populate("settledBy", "name email");

    if (!record) throw new NotFoundException("Commission record not found");
    return record;
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { CreateIncomeDto } from "./dto/create-income.dto";
import { UpdateIncomeDto } from "./dto/update-income.dto";
import { IncomeDocument } from "./schema/income.schema";
import { TransactionTypeEnum } from "../../constant/enums/finance.enum";

@Injectable()
export class IncomeService {
  constructor(
    @InjectModel(collectionsName.income)
    private readonly incomeModel: Model<IncomeDocument>,
  ) {}

  private normalizeInvoicePayload(dto: CreateIncomeDto | UpdateIncomeDto) {
    const normalizedItems = (dto.lineItems || []).map((item) => {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.unitPrice || 0);
      const itemTotal = Number(item.total ?? quantity * unitPrice);

      return {
        name: item.name,
        quantity,
        unitPrice,
        total: itemTotal,
      };
    });

    const subTotal = normalizedItems.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0,
    );
    const tax = Number(dto.tax || 0);
    const discount = Number(dto.discount || 0);

    // If no line items are provided, keep amount-driven behavior for backward compatibility.
    const totalAmount =
      normalizedItems.length > 0
        ? Math.max(0, subTotal + tax - discount)
        : Number(dto.amount || 0);

    return {
      lineItems: normalizedItems,
      subTotal,
      tax,
      discount,
      totalAmount,
      amount: totalAmount,
    };
  }

  async createForMerchant(merchantId: Types.ObjectId, dto: CreateIncomeDto) {
    const invoicePayload = this.normalizeInvoicePayload(dto);

    return this.incomeModel.create({
      merchant: merchantId,
      clinic: dto.clinicId ? new Types.ObjectId(dto.clinicId) : undefined,
      amount: invoicePayload.amount,
      category: dto.category,
      date: dto.date ? new Date(dto.date) : new Date(),
      note: dto.note,
      reference: dto.reference,
      receivedBy: dto.receivedBy,
      transactionType: dto.transactionType || TransactionTypeEnum.INCOME,
      invoiceNo: dto.invoiceNo,
      invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
      partyName: dto.partyName,
      lineItems: invoicePayload.lineItems,
      subTotal: invoicePayload.subTotal,
      tax: invoicePayload.tax,
      discount: invoicePayload.discount,
      totalAmount: invoicePayload.totalAmount,
    });
  }

  async listForMerchant(
    merchantId: Types.ObjectId,
    query?: {
      startDate?: string;
      endDate?: string;
      category?: string;
      transactionType?: TransactionTypeEnum;
    },
  ) {
    const filter: any = { merchant: merchantId };

    if (query?.category) {
      filter.category = query.category;
    }

    if (query?.startDate || query?.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = new Date(query.startDate);
      if (query.endDate) filter.date.$lte = new Date(query.endDate);
    }

    if (query?.transactionType) {
      filter.transactionType = query.transactionType;
    }

    return this.incomeModel.find(filter).sort({ date: -1 });
  }

  async createSaleForMerchant(
    merchantId: Types.ObjectId,
    dto: CreateIncomeDto,
  ) {
    return this.createForMerchant(merchantId, {
      ...dto,
      transactionType: TransactionTypeEnum.SALE,
    });
  }

  async listSalesForMerchant(
    merchantId: Types.ObjectId,
    query?: { startDate?: string; endDate?: string; category?: string },
  ) {
    return this.listForMerchant(merchantId, {
      ...query,
      transactionType: TransactionTypeEnum.SALE,
    });
  }

  async updateForMerchant(
    merchantId: Types.ObjectId,
    incomeId: Types.ObjectId,
    dto: UpdateIncomeDto,
  ) {
    const invoicePayload = this.normalizeInvoicePayload(dto);

    const updated = await this.incomeModel.findOneAndUpdate(
      { _id: incomeId, merchant: merchantId },
      {
        ...dto,
        clinic: dto.clinicId ? new Types.ObjectId(dto.clinicId) : undefined,
        date: dto.date ? new Date(dto.date) : undefined,
        invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
        lineItems: invoicePayload.lineItems,
        subTotal: invoicePayload.subTotal,
        tax: invoicePayload.tax,
        discount: invoicePayload.discount,
        totalAmount: invoicePayload.totalAmount,
        amount: invoicePayload.amount,
      },
      { new: true },
    );

    if (!updated) throw new NotFoundException("Income not found");

    return updated;
  }

  async deleteForMerchant(
    merchantId: Types.ObjectId,
    incomeId: Types.ObjectId,
  ) {
    const deleted = await this.incomeModel.findOneAndDelete({
      _id: incomeId,
      merchant: merchantId,
    });

    if (!deleted) throw new NotFoundException("Income not found");

    return deleted;
  }

  async listAll() {
    return this.incomeModel.find().sort({ date: -1 });
  }
}

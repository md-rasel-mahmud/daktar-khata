import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { ExpenseDocument } from "./schema/expense.schema";
import { TransactionTypeEnum } from "../../constant/enums/finance.enum";

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(collectionsName.expense)
    private readonly expenseModel: Model<ExpenseDocument>,
  ) {}

  private normalizeInvoicePayload(dto: CreateExpenseDto | UpdateExpenseDto) {
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

  async createForMerchant(merchantId: Types.ObjectId, dto: CreateExpenseDto) {
    const invoicePayload = this.normalizeInvoicePayload(dto);

    return this.expenseModel.create({
      merchant: merchantId,
      clinic: dto.clinicId ? new Types.ObjectId(dto.clinicId) : undefined,
      amount: invoicePayload.amount,
      category: dto.category,
      date: dto.date ? new Date(dto.date) : new Date(),
      note: dto.note,
      reference: dto.reference,
      paidTo: dto.paidTo,
      transactionType: dto.transactionType || TransactionTypeEnum.EXPENSE,
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

    return this.expenseModel.find(filter).sort({ date: -1 });
  }

  async createPurchaseForMerchant(
    merchantId: Types.ObjectId,
    dto: CreateExpenseDto,
  ) {
    return this.createForMerchant(merchantId, {
      ...dto,
      transactionType: TransactionTypeEnum.PURCHASE,
    });
  }

  async listPurchasesForMerchant(
    merchantId: Types.ObjectId,
    query?: { startDate?: string; endDate?: string; category?: string },
  ) {
    return this.listForMerchant(merchantId, {
      ...query,
      transactionType: TransactionTypeEnum.PURCHASE,
    });
  }

  async updateForMerchant(
    merchantId: Types.ObjectId,
    expenseId: Types.ObjectId,
    dto: UpdateExpenseDto,
  ) {
    const invoicePayload = this.normalizeInvoicePayload(dto);

    const updated = await this.expenseModel.findOneAndUpdate(
      { _id: expenseId, merchant: merchantId },
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

    if (!updated) throw new NotFoundException("Expense not found");

    return updated;
  }

  async deleteForMerchant(
    merchantId: Types.ObjectId,
    expenseId: Types.ObjectId,
  ) {
    const deleted = await this.expenseModel.findOneAndDelete({
      _id: expenseId,
      merchant: merchantId,
    });

    if (!deleted) throw new NotFoundException("Expense not found");

    return deleted;
  }

  async listAll() {
    return this.expenseModel.find().sort({ date: -1 });
  }
}

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "src/constant";

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(collectionsName.income)
    private readonly incomeModel: Model<any>,
    @InjectModel(collectionsName.expense)
    private readonly expenseModel: Model<any>,
  ) {}

  private buildDateFilter(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) return {};

    const date: any = {};
    if (startDate) date.$gte = new Date(startDate);
    if (endDate) date.$lte = new Date(endDate);

    return { date };
  }

  async getDashboard(
    merchantId: Types.ObjectId,
    query?: { startDate?: string; endDate?: string },
  ) {
    const matchStage: any = {
      merchant: merchantId,
      ...this.buildDateFilter(query?.startDate, query?.endDate),
    };

    const [incomeAgg] = await this.incomeModel.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalIncome: { $sum: "$amount" } } },
    ]);

    const [expenseAgg] = await this.expenseModel.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalExpense: { $sum: "$amount" } } },
    ]);

    const incomeByCategory = await this.incomeModel.aggregate([
      { $match: matchStage },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const expenseByCategory = await this.expenseModel.aggregate([
      { $match: matchStage },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const totalIncome = incomeAgg?.totalIncome || 0;
    const totalExpense = expenseAgg?.totalExpense || 0;

    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      incomeByCategory,
      expenseByCategory,
    };
  }

  async getMonthlyReport(merchantId: Types.ObjectId, year?: number) {
    const targetYear = year || new Date().getFullYear();

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    const matchStage = {
      merchant: merchantId,
      date: { $gte: startDate, $lte: endDate },
    };

    const incomeByMonth = await this.incomeModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { month: { $month: "$date" } },
          totalIncome: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const expenseByMonth = await this.expenseModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { month: { $month: "$date" } },
          totalExpense: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const byMonth = Array.from({ length: 12 }, (_, idx) => {
      const month = idx + 1;
      const income = incomeByMonth.find((item) => item._id.month === month);
      const expense = expenseByMonth.find((item) => item._id.month === month);

      const totalIncome = income?.totalIncome || 0;
      const totalExpense = expense?.totalExpense || 0;

      return {
        month,
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
      };
    });

    return {
      year: targetYear,
      byMonth,
      yearlyIncome: byMonth.reduce((sum, item) => sum + item.totalIncome, 0),
      yearlyExpense: byMonth.reduce((sum, item) => sum + item.totalExpense, 0),
      yearlyNetProfit: byMonth.reduce((sum, item) => sum + item.netProfit, 0),
    };
  }

  async getNetProfit(
    merchantId: Types.ObjectId,
    query?: { startDate?: string; endDate?: string },
  ) {
    const dashboard = await this.getDashboard(merchantId, query);

    return {
      period: {
        startDate: query?.startDate || null,
        endDate: query?.endDate || null,
      },
      totalIncome: dashboard.totalIncome,
      totalExpense: dashboard.totalExpense,
      netProfit: dashboard.netProfit,
    };
  }

  async getInvoices(
    merchantId: Types.ObjectId,
    query?: { startDate?: string; endDate?: string },
  ) {
    const dateFilter = this.buildDateFilter(query?.startDate, query?.endDate);
    const matchStage = {
      merchant: merchantId,
      invoiceNo: { $exists: true, $ne: null },
      ...dateFilter,
    };

    const [incomes, expenses] = await Promise.all([
      this.incomeModel
        .find(matchStage)
        .sort({ date: -1 })
        .select(
          "amount totalAmount subTotal tax discount lineItems category transactionType invoiceNo invoiceDate date partyName",
        ),
      this.expenseModel
        .find(matchStage)
        .sort({ date: -1 })
        .select(
          "amount totalAmount subTotal tax discount lineItems category transactionType invoiceNo invoiceDate date partyName",
        ),
    ]);

    return [...incomes, ...expenses].sort((a: any, b: any) => {
      const aDate = new Date(a.invoiceDate || a.date).getTime();
      const bDate = new Date(b.invoiceDate || b.date).getTime();
      return bDate - aDate;
    });
  }
}

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(collectionsName.patient)
    private readonly patientModel: Model<any>,
    @InjectModel(collectionsName.doctor)
    private readonly doctorModel: Model<any>,
    @InjectModel(collectionsName.staff)
    private readonly staffModel: Model<any>,
    @InjectModel(collectionsName.subscription)
    private readonly subscriptionModel: Model<any>,
    @InjectModel(collectionsName.payment)
    private readonly paymentModel: Model<any>,
    @InjectModel(collectionsName.merchant)
    private readonly merchantModel: Model<any>,
  ) {}

  async merchantStats(merchantId: Types.ObjectId) {
    const clinicsCount = await this.merchantModel.countDocuments({
      _id: merchantId,
    });
    const patients = await this.patientModel.countDocuments({
      merchant: merchantId,
    });
    const doctors = await this.doctorModel.countDocuments({
      merchant: merchantId,
    });
    const employees = await this.staffModel.countDocuments({
      merchant: merchantId,
    });
    const subscription = await this.subscriptionModel
      .findOne({ merchant: merchantId })
      .sort({ createdAt: -1 });
    const lastPayment = await this.paymentModel
      .findOne({ merchant: merchantId })
      .sort({ createdAt: -1 });

    return {
      clinicsCount,
      patients,
      doctors,
      employees,
      subscription,
      lastPayment,
    };
  }

  async superAdminStats() {
    const totalMerchants = await this.merchantModel.countDocuments();
    const activeSubscriptions = await this.subscriptionModel.countDocuments({
      status: "ACTIVE",
    });
    const revenue = await this.paymentModel.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return {
      totalMerchants,
      activeSubscriptions,
      revenue: revenue[0] ? revenue[0].total : 0,
    };
  }
}

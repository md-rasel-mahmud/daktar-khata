import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { Subscription, SubscriptionDocument } from "./subscription.schema";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { ActiveInactiveStatus } from "../../constant/enums/status.enum";
import { MerchantDocument } from "../merchant/schema/merchant.schema";
import { PaymentDocument } from "../payment/payment.schema";

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectModel(collectionsName.subscription)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(collectionsName.merchant)
    private readonly merchantModel: Model<MerchantDocument>,
    @InjectModel(collectionsName.payment)
    private readonly paymentModel: Model<PaymentDocument>
  ) {}

  async createPlan(dto: CreateSubscriptionDto): Promise<Subscription> {
    const monthlyPrice = dto.monthlyPrice || dto.amount || 0;
    const halfYearlyPrice = dto.halfYearlyPrice || monthlyPrice * 6;
    const yearlyPrice = dto.yearlyPrice || monthlyPrice * 12;

    const created = new this.subscriptionModel({
      planName: dto.planName,
      description: dto.description || "",
      amount: monthlyPrice,
      monthlyPrice,
      halfYearlyPrice,
      yearlyPrice,
      doctorLimit: typeof dto.doctorLimit === "number" ? dto.doctorLimit : 5,
      patientLimit: typeof dto.patientLimit === "number" ? dto.patientLimit : 1000,
      staffLimit: typeof dto.staffLimit === "number" ? dto.staffLimit : 10,
      billingCycle: dto.billingCycle || "monthly",
      durationInDays: dto.durationInDays || 30,
      status: dto.status || ActiveInactiveStatus.ACTIVE,
      isDeleted: false,
    });
    return created.save();
  }

  async updatePlan(id: Types.ObjectId, dto: UpdateSubscriptionDto): Promise<Subscription> {
    const updatePayload: any = { ...dto };
    if (dto.monthlyPrice) {
      updatePayload.amount = dto.monthlyPrice;
    }

    const updated = await this.subscriptionModel.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true }
    );

    if (!updated) {
      throw new NotFoundException("Subscription plan not found");
    }
    return updated;
  }

  async getById(id: Types.ObjectId) {
    return this.subscriptionModel.findById(id);
  }

  async getAll() {
    return this.subscriptionModel
      .find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 });
  }

  async getActivePlans() {
    return this.subscriptionModel
      .find({ isDeleted: { $ne: true }, status: ActiveInactiveStatus.ACTIVE })
      .sort({ monthlyPrice: 1 });
  }

  async deleteSubscriptionByAdmin(subscriptionId: Types.ObjectId) {
    // Check if any merchant currently uses this subscription package
    const merchantCount = await this.merchantModel.countDocuments({
      subscriptionPackage: subscriptionId,
    });

    // Check if any historical payment references this subscription
    const paymentCount = await this.paymentModel.countDocuments({
      subscription: subscriptionId,
    });

    if (merchantCount > 0 || paymentCount > 0) {
      // Soft-delete / deactivate safely to preserve audit and payment history
      const archived = await this.subscriptionModel.findByIdAndUpdate(
        subscriptionId,
        {
          isDeleted: true,
          status: ActiveInactiveStatus.INACTIVE,
        },
        { new: true }
      );

      return {
        message:
          "Plan is associated with active merchants or payment records. It has been archived and deactivated safely.",
        data: archived,
      };
    }

    const data = await this.subscriptionModel.findByIdAndDelete(subscriptionId);
    if (!data) {
      throw new NotFoundException("Subscription plan not found");
    }

    return {
      message: "Subscription plan deleted successfully",
      data,
    };
  }
}

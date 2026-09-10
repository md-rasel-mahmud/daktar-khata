import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { SubscriptionDocument } from "./subscription.schema";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { SubscriptionStatus } from "src/constant/enums/status.enum";

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  constructor(
    @InjectModel(collectionsName.subscription)
    private readonly subscriptionModel: Model<SubscriptionDocument>
  ) {}

  async createForMerchant(
    merchantId: Types.ObjectId,
    dto: CreateSubscriptionDto
  ) {
    const created = new this.subscriptionModel({
      merchant: merchantId,
      planName: dto.planName,
      amount: dto.amount,
      durationInDays: dto.durationInDays,
      status: dto.status,
    });
    return created.save();
  }

  async getById(id: Types.ObjectId) {
    return this.subscriptionModel.findById(id);
  }

  async getAll() {
    return this.subscriptionModel.find().sort({ createdAt: -1 });
  }

  async deleteSubscriptionByAdmin(subscriptionId: Types.ObjectId) {
    const data = await this.subscriptionModel.findByIdAndDelete(subscriptionId);

    if (!data) {
      throw new BadRequestException("Failed to delete subscription");
    }
    return {
      message: "Subscription deleted successfully",
      data,
    };
  }
}

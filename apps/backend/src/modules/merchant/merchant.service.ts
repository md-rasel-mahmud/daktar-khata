import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model, Types } from "mongoose";

import { CreateMerchantDto } from "./dto/create-merchant.dto";
import { UpdateMerchantDto } from "./dto/update-merchant.dto";
import { collectionsName } from "../../constant";
import {
  Merchant,
  MerchantDocument,
} from "./schema/merchant.schema";
import { SubscriptionStatus } from "../../constant/enums/status.enum";

@Injectable()
export class MerchantService {
  constructor(
    @InjectModel(collectionsName.merchant)
    private merchantModel: Model<Merchant>
  ) {}

  async create(
    createMerchantDto: CreateMerchantDto,
    session?: ClientSession
  ): Promise<Merchant> {
    const merchant = new this.merchantModel({
      ...createMerchantDto,
      subscriptionStatus: SubscriptionStatus.PENDING,
    });
    return merchant.save({ session });
  }

  async findAll(): Promise<Merchant[]> {
    return this.merchantModel.find().populate("subscriptionPackage").exec();
  }

  async findOneById(id: string): Promise<Merchant> {
    const merchant = await this.merchantModel
      .findById(id)
      .populate("user subscriptionPackage");

    if (!merchant) {
      throw new NotFoundException("Merchant not found");
    }
    return merchant;
  }

  async findOneByUser(userId: Types.ObjectId): Promise<Merchant> {
    const merchant = await this.merchantModel
      .findOne({ user: userId })
      .populate(
        "user subscriptionPackage",
        "-password -createdAt -updatedAt -status"
      );
    if (!merchant) {
      throw new NotFoundException("Merchant not found");
    }
    return merchant;
  }

  async getMerchantByUser(userID: string): Promise<MerchantDocument> {
    const merchant = await this.merchantModel
      .findOne({ user: userID })
      .populate("user subscriptionPackage");
    if (!merchant) {
      throw new NotFoundException("Merchant not found");
    }
    return merchant;
  }

  async update(
    id: string,
    updateMerchantDto: UpdateMerchantDto,
    session?: ClientSession
  ): Promise<Merchant> {
    const updated = await this.merchantModel
      .findByIdAndUpdate(id, updateMerchantDto, { new: true })
      .populate("subscriptionPackage")
      .session(session);

    if (!updated) {
      throw new NotFoundException("Merchant not found for update");
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.merchantModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException("Merchant not found for delete");
    }
  }

  // cron
  async expireAllMerchantSubscription(): Promise<void> {
    const now = new Date();

    const result = await this.merchantModel.updateMany(
      {
        subscriptionEndDate: { $lt: now }, // find merchants whose subscription already expired
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      },
      {
        $set: {
          subscriptionStatus: SubscriptionStatus.EXPIRED, // mark as expired
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.warn(
        `${result.modifiedCount} merchant subscriptions expired successfully.`
      );
    } else {
      console.error("No merchant subscriptions expired at this time.");
    }
  }

  async verifyPaymentAndActivateMerchantSubscription(
    merchantId: Types.ObjectId,
    subscriptionId: Types.ObjectId,
    durationInDays: number
  ) {
    const activatedMerchant = await this.merchantModel.findByIdAndUpdate(
      merchantId,
      {
        subscriptionPackage: subscriptionId,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(
          Date.now() + durationInDays * 24 * 60 * 60 * 1000 // One day equals 24 hours × 60 minutes × 60 seconds × 1000 milliseconds
        ),
      },
      { new: true }
    );

    return activatedMerchant;
  }
}

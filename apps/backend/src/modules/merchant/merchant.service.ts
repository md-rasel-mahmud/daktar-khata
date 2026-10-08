import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model, Types } from "mongoose";

import { CreateMerchantDto } from "./dto/create-merchant.dto";
import { UpdateMerchantDto } from "./dto/update-merchant.dto";
import { collectionsName, Status } from "../../constant";
import { Merchant, MerchantDocument } from "./schema/merchant.schema";
import { SubscriptionStatus } from "../../constant/enums/status.enum";
import { SubscriptionDocument } from "../subscription/subscription.schema";
import { User } from "../user/schema/user.schema";

@Injectable()
export class MerchantService {
  constructor(
    @InjectModel(collectionsName.merchant)
    private merchantModel: Model<MerchantDocument>,
    @InjectModel(collectionsName.user)
    private userModel: Model<User>,
    @InjectModel(collectionsName.doctor)
    private doctorModel: Model<any>,
    @InjectModel(collectionsName.patient)
    private patientModel: Model<any>,
    @InjectModel(collectionsName.staff)
    private staffModel: Model<any>,
    @InjectModel(collectionsName.subscription)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(collectionsName.clinic)
    private clinicModel: Model<any>
  ) {}

  async create(
    createMerchantDto: CreateMerchantDto,
    session?: ClientSession
  ): Promise<Merchant> {
    const now = new Date();
    // 3-day demo subscription by default
    const demoEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const subdomain = createMerchantDto.subdomain
      ? createMerchantDto.subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, "")
      : undefined;

    const domain = createMerchantDto.domain
      ? createMerchantDto.domain.trim().toLowerCase()
      : subdomain
      ? `${subdomain}.localhost`
      : undefined;

    const merchant = new this.merchantModel({
      ...createMerchantDto,
      subdomain,
      domain,
      status: createMerchantDto.status || Status.ACTIVE,
      subscriptionStatus: SubscriptionStatus.DEMO,
      subscriptionStartDate: now,
      subscriptionEndDate: createMerchantDto.subscriptionEndDate
        ? new Date(createMerchantDto.subscriptionEndDate)
        : demoEndDate,
    });
    return merchant.save({ session });
  }

  async findAll(): Promise<Merchant[]> {
    return this.merchantModel.find().populate("subscriptionPackage").sort({ createdAt: -1 }).exec();
  }

  async getMerchantsWithAggregates() {
    return this.merchantModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "subscriptionPackage",
          foreignField: "_id",
          as: "subscriptionInfo",
        },
      },
      {
        $lookup: {
          from: "clinics",
          let: { mId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$merchant", "$$mId"] } } },
            { $count: "count" },
          ],
          as: "clinicsCount",
        },
      },
      {
        $lookup: {
          from: "doctors",
          let: { mId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$merchant", "$$mId"] } } },
            { $count: "count" },
          ],
          as: "doctorsCount",
        },
      },
      {
        $lookup: {
          from: "patients",
          let: { mId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$merchant", "$$mId"] } } },
            { $count: "count" },
          ],
          as: "patientsCount",
        },
      },
      {
        $lookup: {
          from: "staffs",
          let: { mId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$merchant", "$$mId"] } } },
            { $count: "count" },
          ],
          as: "staffCount",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$userInfo", 0] },
          subscriptionPackage: { $arrayElemAt: ["$subscriptionInfo", 0] },
          totalClinics: {
            $ifNull: [{ $arrayElemAt: ["$clinicsCount.count", 0] }, 0],
          },
          totalDoctors: {
            $ifNull: [{ $arrayElemAt: ["$doctorsCount.count", 0] }, 0],
          },
          totalPatients: {
            $ifNull: [{ $arrayElemAt: ["$patientsCount.count", 0] }, 0],
          },
          totalStaff: {
            $ifNull: [{ $arrayElemAt: ["$staffCount.count", 0] }, 0],
          },
        },
      },
      {
        $project: {
          userInfo: 0,
          subscriptionInfo: 0,
          clinicsCount: 0,
          doctorsCount: 0,
          patientsCount: 0,
          staffCount: 0,
          "user.password": 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
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
        "-password -createdAt -updatedAt"
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

  async updateStatus(id: string, status: Status): Promise<Merchant> {
    if (![Status.ACTIVE, Status.INACTIVE, Status.BANNED].includes(status)) {
      throw new BadRequestException("Invalid merchant status provided");
    }

    const merchant = await this.merchantModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!merchant) {
      throw new NotFoundException("Merchant not found");
    }

    // Synchronize associated user account status
    if (merchant.user) {
      await this.userModel.findByIdAndUpdate(merchant.user, {
        status,
        isActive: status === Status.ACTIVE,
      });
    }

    return merchant;
  }

  async checkQuotaLimit(
    merchantId: Types.ObjectId,
    type: "doctor" | "patient" | "staff"
  ): Promise<void> {
    const merchant = await this.merchantModel
      .findById(merchantId)
      .populate("subscriptionPackage");

    if (!merchant || !merchant.subscriptionPackage) {
      // If no subscription package assigned (e.g. demo), allow default reasonable quota (e.g. 5)
      return;
    }

    const plan = merchant.subscriptionPackage as any;

    if (type === "doctor") {
      const limit = plan.doctorLimit;
      if (typeof limit === "number" && limit > 0) {
        const count = await this.doctorModel.countDocuments({
          merchant: merchantId,
        });
        if (count >= limit) {
          throw new BadRequestException(
            `Doctor limit reached: Your current plan allows up to ${limit} doctors. Please upgrade your subscription to add more.`
          );
        }
      }
    } else if (type === "patient") {
      const limit = plan.patientLimit;
      if (typeof limit === "number" && limit > 0) {
        const count = await this.patientModel.countDocuments({
          merchant: merchantId,
        });
        if (count >= limit) {
          throw new BadRequestException(
            `Patient limit reached: Your current plan allows up to ${limit} patients. Please upgrade your subscription to add more.`
          );
        }
      }
    } else if (type === "staff") {
      const limit = plan.staffLimit;
      if (typeof limit === "number" && limit > 0) {
        const count = await this.staffModel.countDocuments({
          merchant: merchantId,
        });
        if (count >= limit) {
          throw new BadRequestException(
            `Staff limit reached: Your current plan allows up to ${limit} staff members. Please upgrade your subscription to add more.`
          );
        }
      }
    }
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
        subscriptionEndDate: { $lt: now },
        subscriptionStatus: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.DEMO] },
      },
      {
        $set: {
          subscriptionStatus: SubscriptionStatus.EXPIRED,
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.warn(
        `${result.modifiedCount} merchant subscriptions expired successfully.`
      );
    }
  }

  async verifyPaymentAndActivateMerchantSubscription(
    merchantId: Types.ObjectId,
    subscriptionId: Types.ObjectId,
    durationInDays: number
  ) {
    const currentMerchant = await this.merchantModel.findById(merchantId);
    if (!currentMerchant) {
      throw new NotFoundException("Merchant not found");
    }

    const now = new Date();
    let baseDate = now;

    // If merchant has a valid unexpired subscription, extend from existing expiry date
    if (
      currentMerchant.subscriptionEndDate &&
      new Date(currentMerchant.subscriptionEndDate) > now &&
      currentMerchant.subscriptionStatus === SubscriptionStatus.ACTIVE
    ) {
      baseDate = new Date(currentMerchant.subscriptionEndDate);
    }

    const newEndDate = new Date(
      baseDate.getTime() + durationInDays * 24 * 60 * 60 * 1000
    );

    const activatedMerchant = await this.merchantModel.findByIdAndUpdate(
      merchantId,
      {
        subscriptionPackage: subscriptionId,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionStartDate: now,
        subscriptionEndDate: newEndDate,
      },
      { new: true }
    );

    return activatedMerchant;
  }
}

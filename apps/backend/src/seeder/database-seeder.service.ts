import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../modules/user/schema/user.schema";
import { RolesEnum, collectionsName } from "../constant";
import { SubscriptionDocument } from "../modules/subscription/subscription.schema";

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(collectionsName.subscription)
    private readonly subscriptionModel: Model<SubscriptionDocument>
  ) {}

  async onModuleInit() {
    await this.seedAdmins();
    await this.seedSubscriptions();
  }

  private async seedAdmins() {
    const superAdminExists = await this.userModel.exists({
      role: RolesEnum.SUPER_ADMIN,
    });

    const adminExists = await this.userModel.exists({ role: RolesEnum.ADMIN });

    // SUPER ADMIN CREATE
    if (!superAdminExists) {
      const password = "superadmin123";

      await this.userModel.create({
        name: "Super Admin",
        email: "superadmin@example.com",
        phone: "01700000000",
        password,
        role: RolesEnum.SUPER_ADMIN,
        isActive: true,
      });
      this.logger.log("Super Admin created successfully!");
    }

    // ADMIN CREATE
    if (!adminExists) {
      const password = "admin123";

      await this.userModel.create({
        name: "Admin",
        email: "admin@example.com",
        phone: "01800000000",
        password,
        role: RolesEnum.ADMIN,
        isActive: true,
      });
      this.logger.log("Admin created successfully!");
    }
  }

  private async seedSubscriptions() {
    const planCount = await this.subscriptionModel.countDocuments();
    if (planCount === 0) {
      await this.subscriptionModel.create([
        {
          planName: "Starter Clinic Plan",
          description: "Ideal for individual practitioners and small clinics",
          amount: 1500,
          monthlyPrice: 1500,
          halfYearlyPrice: 8000,
          yearlyPrice: 15000,
          doctorLimit: 5,
          patientLimit: 1000,
          staffLimit: 10,
          durationInDays: 30,
          billingCycle: "monthly",
          status: "ACTIVE",
          isDeleted: false,
        },
        {
          planName: "Professional Hospital Plan",
          description: "Full-featured for medium-sized diagnostic centers and clinics",
          amount: 3000,
          monthlyPrice: 3000,
          halfYearlyPrice: 16000,
          yearlyPrice: 30000,
          doctorLimit: 15,
          patientLimit: 5000,
          staffLimit: 25,
          durationInDays: 30,
          billingCycle: "monthly",
          status: "ACTIVE",
          isDeleted: false,
        },
        {
          planName: "Enterprise Multi-Specialty Plan",
          description: "Unlimited scale for large multi-branch hospital chains",
          amount: 6000,
          monthlyPrice: 6000,
          halfYearlyPrice: 32000,
          yearlyPrice: 60000,
          doctorLimit: 50,
          patientLimit: 20000,
          staffLimit: 100,
          durationInDays: 30,
          billingCycle: "monthly",
          status: "ACTIVE",
          isDeleted: false,
        },
      ]);
      this.logger.log("Default subscription plans seeded successfully!");
    }
  }
}

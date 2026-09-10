import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { User } from "../modules/user/schema/user.schema";
import { RolesEnum } from "../constant";

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>
  ) {}

  async onModuleInit() {
    await this.seedAdmins();
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
}

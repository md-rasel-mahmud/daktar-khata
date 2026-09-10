import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Permission } from "./permissions.schema";

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private permModel: Model<Permission>
  ) {}

  async findAll() {
    return this.permModel.find().lean();
  }

  async findByKey(key: string) {
    return this.permModel.findOne({ key }).lean();
  }

  async create(permission: Partial<Permission>) {
    const doc = new this.permModel(permission);
    return doc.save();
  }
}

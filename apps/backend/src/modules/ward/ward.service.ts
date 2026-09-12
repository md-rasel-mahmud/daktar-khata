import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { WardDocument } from "./schema/ward.schema";
import { CreateWardDto } from "./dto/create-ward.dto";
import { UpdateWardDto } from "./dto/update-ward.dto";

@Injectable()
export class WardService {
  constructor(
    @InjectModel(collectionsName.ward)
    private readonly wardModel: Model<WardDocument>,
  ) {}

  async create(dto: CreateWardDto, merchantId: Types.ObjectId) {
    return this.wardModel.create({ ...dto, merchant: merchantId });
  }

  async findAll(merchantId?: string) {
    const filter: any = { isActive: true };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    return this.wardModel.find(filter).sort({ name: 1 });
  }

  async findOne(id: string) {
    const ward = await this.wardModel.findById(new Types.ObjectId(id));
    if (!ward) throw new NotFoundException("Ward not found");
    return ward;
  }

  async update(id: string, dto: UpdateWardDto) {
    const ward = await this.wardModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      dto,
      { new: true },
    );
    if (!ward) throw new NotFoundException("Ward not found");
    return ward;
  }

  async softDelete(id: string) {
    const ward = await this.wardModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { isActive: false },
      { new: true },
    );
    if (!ward) throw new NotFoundException("Ward not found");
    return { message: "Ward deactivated", ward };
  }
}

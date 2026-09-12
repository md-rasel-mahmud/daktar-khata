import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { BedDocument } from "./schema/bed.schema";
import { CreateBedDto } from "./dto/create-bed.dto";
import { UpdateBedDto } from "./dto/update-bed.dto";
import { BedStatus } from "src/constant/enums/status.enum";

@Injectable()
export class BedService {
  constructor(
    @InjectModel(collectionsName.bed)
    private readonly bedModel: Model<BedDocument>,
  ) {}

  async create(dto: CreateBedDto, merchantId: Types.ObjectId) {
    return this.bedModel.create({
      ...dto,
      room: new Types.ObjectId(dto.room),
      ward: new Types.ObjectId(dto.ward),
      merchant: merchantId,
    });
  }

  async findAll(wardId?: string, roomId?: string, status?: string, merchantId?: string) {
    const filter: any = {};
    if (wardId) filter.ward = new Types.ObjectId(wardId);
    if (roomId) filter.room = new Types.ObjectId(roomId);
    if (status) filter.status = status;
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    return this.bedModel
      .find(filter)
      .sort({ bedNumber: 1 })
      .populate("ward", "name")
      .populate("room", "name");
  }

  async findOne(id: string) {
    const bed = await this.bedModel
      .findById(new Types.ObjectId(id))
      .populate("ward", "name")
      .populate("room", "name");
    if (!bed) throw new NotFoundException("Bed not found");
    return bed;
  }

  async update(id: string, dto: UpdateBedDto) {
    const updateData: any = { ...dto };
    if (dto.room) updateData.room = new Types.ObjectId(dto.room);
    if (dto.ward) updateData.ward = new Types.ObjectId(dto.ward);
    const bed = await this.bedModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      updateData,
      { new: true },
    );
    if (!bed) throw new NotFoundException("Bed not found");
    return bed;
  }

  async updateStatus(id: string, status: BedStatus) {
    const bed = await this.bedModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { status },
      { new: true },
    );
    if (!bed) throw new NotFoundException("Bed not found");
    return bed;
  }
}

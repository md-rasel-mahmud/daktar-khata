import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { RoomDocument } from "./schema/room.schema";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(collectionsName.room)
    private readonly roomModel: Model<RoomDocument>,
  ) {}

  async create(dto: CreateRoomDto, merchantId: Types.ObjectId) {
    return this.roomModel.create({
      ...dto,
      ward: new Types.ObjectId(dto.ward),
      merchant: merchantId,
    });
  }

  async findAll(wardId?: string, merchantId?: string) {
    const filter: any = { isActive: true };
    if (wardId) filter.ward = new Types.ObjectId(wardId);
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    return this.roomModel.find(filter).sort({ name: 1 }).populate("ward", "name");
  }

  async findOne(id: string) {
    const room = await this.roomModel
      .findById(new Types.ObjectId(id))
      .populate("ward", "name");
    if (!room) throw new NotFoundException("Room not found");
    return room;
  }

  async update(id: string, dto: UpdateRoomDto) {
    const updateData: any = { ...dto };
    if (dto.ward) updateData.ward = new Types.ObjectId(dto.ward);
    const room = await this.roomModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      updateData,
      { new: true },
    );
    if (!room) throw new NotFoundException("Room not found");
    return room;
  }

  async softDelete(id: string) {
    const room = await this.roomModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { isActive: false },
      { new: true },
    );
    if (!room) throw new NotFoundException("Room not found");
    return { message: "Room deactivated", room };
  }
}

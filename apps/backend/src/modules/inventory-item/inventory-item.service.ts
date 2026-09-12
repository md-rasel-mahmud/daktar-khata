import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { InventoryItemDocument } from "./schema/inventory-item.schema";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { UpdateInventoryItemDto } from "./dto/update-inventory-item.dto";
import { InventoryCategory } from "../../constant/enums/status.enum";

@Injectable()
export class InventoryItemService {
  constructor(
    @InjectModel(collectionsName.inventoryItem)
    private readonly itemModel: Model<InventoryItemDocument>,
  ) {}

  async create(dto: CreateInventoryItemDto, merchantId: Types.ObjectId) {
    return this.itemModel.create({
      ...dto,
      supplier: dto.supplier ? new Types.ObjectId(dto.supplier) : null,
      currentStock: 0,
      merchant: merchantId,
      isActive: true,
    });
  }

  async findAll(
    merchantId?: string,
    category?: InventoryCategory,
    supplierId?: string,
    search?: string,
  ) {
    const filter: any = { isActive: true };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    if (category) filter.category = category;
    if (supplierId) filter.supplier = new Types.ObjectId(supplierId);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { genericName: { $regex: search, $options: "i" } },
      ];
    }
    return this.itemModel
      .find(filter)
      .populate("supplier", "name phone contactPerson")
      .sort({ name: 1 });
  }

  async findLowStock(merchantId?: string) {
    const filter: any = {
      isActive: true,
      $expr: { $lte: ["$currentStock", "$reorderLevel"] },
    };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);

    return this.itemModel
      .find(filter)
      .populate("supplier", "name phone contactPerson")
      .sort({ currentStock: 1 });
  }

  async findOne(id: string) {
    const item = await this.itemModel
      .findById(new Types.ObjectId(id))
      .populate("supplier", "name phone contactPerson address");
    if (!item) throw new NotFoundException("Inventory item not found");
    return item;
  }

  async update(id: string, dto: UpdateInventoryItemDto) {
    const updatePayload: any = { ...dto };
    if (dto.supplier) {
      updatePayload.supplier = new Types.ObjectId(dto.supplier);
    }

    const item = await this.itemModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      updatePayload,
      { new: true },
    );
    if (!item) throw new NotFoundException("Inventory item not found");
    return item;
  }

  async softDelete(id: string) {
    const item = await this.itemModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { isActive: false },
      { new: true },
    );
    if (!item) throw new NotFoundException("Inventory item not found");
    return { message: "Inventory item deactivated", item };
  }
}

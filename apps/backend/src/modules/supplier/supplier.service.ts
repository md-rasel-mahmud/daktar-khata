import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { SupplierDocument } from "./schema/supplier.schema";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(collectionsName.supplier)
    private readonly supplierModel: Model<SupplierDocument>,
  ) {}

  async create(dto: CreateSupplierDto, merchantId: Types.ObjectId) {
    return this.supplierModel.create({ ...dto, merchant: merchantId });
  }

  async findAll(merchantId?: string, search?: string) {
    const filter: any = { isActive: true };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
      ];
    }
    return this.supplierModel.find(filter).sort({ name: 1 });
  }

  async findOne(id: string) {
    const supplier = await this.supplierModel.findById(new Types.ObjectId(id));
    if (!supplier) throw new NotFoundException("Supplier not found");
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto) {
    const supplier = await this.supplierModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      dto,
      { new: true },
    );
    if (!supplier) throw new NotFoundException("Supplier not found");
    return supplier;
  }

  async softDelete(id: string) {
    const supplier = await this.supplierModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { isActive: false },
      { new: true },
    );
    if (!supplier) throw new NotFoundException("Supplier not found");
    return { message: "Supplier deactivated", supplier };
  }
}

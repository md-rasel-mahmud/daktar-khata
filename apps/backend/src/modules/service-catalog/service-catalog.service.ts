import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { ServiceCatalogDocument } from "./schema/service-catalog.schema";
import { CreateServiceCatalogDto } from "./dto/create-service-catalog.dto";
import { UpdateServiceCatalogDto } from "./dto/update-service-catalog.dto";
import { ServiceCategory } from "../../constant/enums/status.enum";

@Injectable()
export class ServiceCatalogService {
  constructor(
    @InjectModel(collectionsName.serviceCatalog)
    private readonly serviceCatalogModel: Model<ServiceCatalogDocument>,
  ) {}

  async create(dto: CreateServiceCatalogDto, merchantId: Types.ObjectId) {
    return this.serviceCatalogModel.create({ ...dto, merchant: merchantId });
  }

  async findAll(merchantId?: string, category?: ServiceCategory, search?: string) {
    const filter: any = { isActive: true };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }
    return this.serviceCatalogModel.find(filter).sort({ name: 1 });
  }

  async findOne(id: string) {
    const service = await this.serviceCatalogModel.findById(new Types.ObjectId(id));
    if (!service) throw new NotFoundException("Service not found");
    return service;
  }

  async update(id: string, dto: UpdateServiceCatalogDto) {
    const service = await this.serviceCatalogModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      dto,
      { new: true },
    );
    if (!service) throw new NotFoundException("Service not found");
    return service;
  }

  async softDelete(id: string) {
    const service = await this.serviceCatalogModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { isActive: false },
      { new: true },
    );
    if (!service) throw new NotFoundException("Service not found");
    return { message: "Service deactivated", service };
  }
}

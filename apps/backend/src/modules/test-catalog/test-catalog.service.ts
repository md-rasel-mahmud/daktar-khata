import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { TestCatalogDocument } from "./schema/test-catalog.schema";
import { CreateTestCatalogDto } from "./dto/create-test-catalog.dto";
import { UpdateTestCatalogDto } from "./dto/update-test-catalog.dto";

@Injectable()
export class TestCatalogService {
  constructor(
    @InjectModel(collectionsName.testCatalog)
    private readonly testCatalogModel: Model<TestCatalogDocument>,
  ) {}

  async create(dto: CreateTestCatalogDto, merchantId: Types.ObjectId) {
    return this.testCatalogModel.create({
      ...dto,
      merchant: merchantId,
    });
  }

  async findAll(merchantId?: string) {
    const filter: any = { isActive: true };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    return this.testCatalogModel.find(filter).sort({ name: 1 });
  }

  async findOne(id: string) {
    const test = await this.testCatalogModel.findById(new Types.ObjectId(id));
    if (!test) throw new NotFoundException("Test not found in catalog");
    return test;
  }

  async update(id: string, dto: UpdateTestCatalogDto) {
    const test = await this.testCatalogModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      dto,
      { new: true },
    );
    if (!test) throw new NotFoundException("Test not found in catalog");
    return test;
  }

  async softDelete(id: string) {
    const test = await this.testCatalogModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { isActive: false },
      { new: true },
    );
    if (!test) throw new NotFoundException("Test not found in catalog");
    return { message: "Test deactivated", test };
  }
}

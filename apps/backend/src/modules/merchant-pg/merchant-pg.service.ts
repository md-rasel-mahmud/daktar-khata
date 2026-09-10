import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { CreateMerchantPGDto } from "./dto/create-merchant-pg.dto";
import { UpdateMerchantPGDto } from "./dto/update-merchant-pg.dto";
import { MerchantPG } from "src/modules/merchant-pg/schema/merchant-pg.schema";

@Injectable()
export class MerchantPGService {
  constructor(
    @InjectModel(collectionsName.merchantPG)
    private readonly merchantPGModel: Model<MerchantPG>
  ) {}

  //  Create
  async create(merchant: Types.ObjectId, dto: CreateMerchantPGDto) {
    const findMerchantPG = await this.merchantPGModel.findOne({
      merchant,
    });

    if (findMerchantPG)
      throw new NotFoundException(
        "MerchantPG already exists for this merchant"
      );

    return this.merchantPGModel.create({ ...dto, merchant });
  }

  //  List for specific merchant
  async getSinglePG(merchant: Types.ObjectId) {
    return this.merchantPGModel.findOne({ merchant });
  }

  //  List all (super admin)
  async listAll() {
    return this.merchantPGModel.find();
  }

  //  Get single
  async getById(id: Types.ObjectId) {
    const doc = await this.merchantPGModel
      .findById(id)
      .populate("merchant user");
    if (!doc) throw new NotFoundException("MerchantPG not found");
    return doc;
  }

  //  Update
  async updateForMerchant(
    merchantId: Types.ObjectId,
    dto: UpdateMerchantPGDto
  ) {
    const merchantPg = await this.merchantPGModel.findOneAndUpdate(
      { merchant: merchantId },
      dto,
      { new: true }
    );
    if (!merchantPg) {
      return await this.create(merchantId, dto);
    }
    return merchantPg;
  }

  //  Delete
  async deleteForMerchant(merchantId: Types.ObjectId, id: Types.ObjectId) {
    const deleted = await this.merchantPGModel.findOneAndDelete({
      _id: id,
      merchant: merchantId,
    });
    if (!deleted) throw new NotFoundException("MerchantPG not found");
    return deleted;
  }
}

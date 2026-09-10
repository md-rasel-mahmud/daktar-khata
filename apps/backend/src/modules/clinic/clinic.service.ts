import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { Clinic, ClinicDocument } from "./schema/clinic.schema";
import { CreateClinicDto } from "./dto/create-clinic.dto";
import { UpdateClinicDto } from "./dto/update-clinic.dto";

@Injectable()
export class ClinicService {
  constructor(
    @InjectModel(collectionsName.clinic)
    private readonly clinicModel: Model<ClinicDocument>
  ) {}

  async createForMerchant(merchantId: Types.ObjectId, dto: CreateClinicDto) {
    const created = new this.clinicModel({ ...dto, merchant: merchantId });
    return created.save();
  }

  async updateForMerchant(
    merchantId: Types.ObjectId,
    clinicId: Types.ObjectId,
    dto: UpdateClinicDto
  ) {
    const clinic = await this.clinicModel.findOneAndUpdate(
      { _id: clinicId, merchant: merchantId },
      dto,
      { new: true }
    );
    if (!clinic) throw new NotFoundException("Clinic not found");
    return clinic;
  }

  async deleteForMerchant(
    merchantId: Types.ObjectId,
    clinicId: Types.ObjectId
  ) {
    const clinic = await this.clinicModel.findOneAndDelete({
      _id: clinicId,
      merchant: merchantId,
    });
    if (!clinic) throw new NotFoundException("Clinic not found");
    return clinic;
  }

  async listForMerchant(merchantId: Types.ObjectId) {
    return this.clinicModel.find({ merchant: merchantId });
  }

  async getById(clinicId: Types.ObjectId) {
    return this.clinicModel.findById(clinicId);
  }

  async listAll() {
    return this.clinicModel.find();
  }
}

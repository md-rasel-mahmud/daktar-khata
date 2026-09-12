import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { CommissionRuleDocument } from "./schema/commission-rule.schema";
import { CreateCommissionRuleDto } from "./dto/create-commission-rule.dto";
import { UpdateCommissionRuleDto } from "./dto/update-commission-rule.dto";

@Injectable()
export class CommissionRuleService {
  constructor(
    @InjectModel(collectionsName.commissionRule)
    private readonly commissionRuleModel: Model<CommissionRuleDocument>,
  ) {}

  async create(dto: CreateCommissionRuleDto, merchantId: Types.ObjectId) {
    return this.commissionRuleModel.create({
      ...dto,
      doctor: new Types.ObjectId(dto.doctor),
      service: dto.service ? new Types.ObjectId(dto.service) : null,
      effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : new Date(),
      merchant: merchantId,
    });
  }

  async findAll(merchantId?: string, doctorId?: string, serviceId?: string) {
    const filter: any = { isActive: true };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    if (doctorId) filter.doctor = new Types.ObjectId(doctorId);
    if (serviceId) filter.service = new Types.ObjectId(serviceId);

    return this.commissionRuleModel
      .find(filter)
      .populate("doctor", "name phone specialization")
      .populate("service", "name category defaultPrice")
      .sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const rule = await this.commissionRuleModel
      .findById(new Types.ObjectId(id))
      .populate("doctor", "name phone specialization")
      .populate("service", "name category defaultPrice");
    if (!rule) throw new NotFoundException("Commission rule not found");
    return rule;
  }

  async update(id: string, dto: UpdateCommissionRuleDto) {
    const updatePayload: any = { ...dto };
    if (dto.doctor) updatePayload.doctor = new Types.ObjectId(dto.doctor);
    if (dto.service) updatePayload.service = new Types.ObjectId(dto.service);
    if (dto.effectiveDate) updatePayload.effectiveDate = new Date(dto.effectiveDate);

    const rule = await this.commissionRuleModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      updatePayload,
      { new: true },
    );
    if (!rule) throw new NotFoundException("Commission rule not found");
    return rule;
  }

  async softDelete(id: string) {
    const rule = await this.commissionRuleModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { isActive: false },
      { new: true },
    );
    if (!rule) throw new NotFoundException("Commission rule not found");
    return { message: "Commission rule deactivated", rule };
  }
}

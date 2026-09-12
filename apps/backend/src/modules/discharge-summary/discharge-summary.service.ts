import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { DischargeSummaryDocument } from "./schema/discharge-summary.schema";
import { CreateDischargeSummaryDto } from "./dto/create-discharge-summary.dto";
import { UpdateDischargeSummaryDto } from "./dto/update-discharge-summary.dto";

@Injectable()
export class DischargeSummaryService {
  constructor(
    @InjectModel(collectionsName.dischargeSummary)
    private readonly dischargeSummaryModel: Model<DischargeSummaryDocument>,
  ) {}

  async create(dto: CreateDischargeSummaryDto, merchantId: Types.ObjectId) {
    const existing = await this.dischargeSummaryModel.findOne({
      admission: new Types.ObjectId(dto.admission),
      isActive: true,
    });
    if (existing) {
      throw new BadRequestException(
        "A discharge summary already exists for this admission",
      );
    }

    return this.dischargeSummaryModel.create({
      ...dto,
      admission: new Types.ObjectId(dto.admission),
      patient: new Types.ObjectId(dto.patient),
      doctor: new Types.ObjectId(dto.doctor),
      dischargeDate: dto.dischargeDate ? new Date(dto.dischargeDate) : new Date(),
      followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : null,
      dischargeMedicines: dto.dischargeMedicines || [],
      merchant: merchantId,
      isActive: true,
    });
  }

  async update(id: string, dto: UpdateDischargeSummaryDto) {
    const updatePayload: any = { ...dto };
    if (dto.doctor) updatePayload.doctor = new Types.ObjectId(dto.doctor);
    if (dto.dischargeDate) updatePayload.dischargeDate = new Date(dto.dischargeDate);
    if (dto.followUpDate) updatePayload.followUpDate = new Date(dto.followUpDate);

    const summary = await this.dischargeSummaryModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      updatePayload,
      { new: true },
    );
    if (!summary) throw new NotFoundException("Discharge summary not found");
    return summary;
  }

  async findOne(id: string) {
    const summary = await this.dischargeSummaryModel
      .findById(new Types.ObjectId(id))
      .populate("patient", "name phone email gender age bloodGroup")
      .populate("doctor", "name phone specialization department")
      .populate("admission", "admissionNumber admissionDate room bed");

    if (!summary) throw new NotFoundException("Discharge summary not found");
    return summary;
  }

  async findByAdmission(admissionId: string, merchantId?: string) {
    const filter: any = {
      admission: new Types.ObjectId(admissionId),
      isActive: true,
    };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);

    const summary = await this.dischargeSummaryModel
      .findOne(filter)
      .populate("patient", "name phone gender age bloodGroup")
      .populate("doctor", "name phone specialization")
      .populate("admission", "admissionNumber admissionDate room bed");

    if (!summary) {
      throw new NotFoundException(
        "Discharge summary not found for this admission",
      );
    }
    return summary;
  }

  async findByPatient(patientId: string, merchantId?: string) {
    const filter: any = {
      patient: new Types.ObjectId(patientId),
      isActive: true,
    };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);

    return this.dischargeSummaryModel
      .find(filter)
      .populate("doctor", "name specialization")
      .populate("admission", "admissionNumber")
      .sort({ dischargeDate: -1 });
  }
}

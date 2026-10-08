import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { PrescriptionDocument } from "./schema/prescription.schema";
import { CreatePrescriptionDto } from "./dto/create-prescription.dto";
import { UpdatePrescriptionDto } from "./dto/update-prescription.dto";
import { PrescriptionStatus } from "../../constant/enums/status.enum";
import { DoctorService } from "../doctor/doctor.service";

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectModel(collectionsName.prescription)
    private readonly prescriptionModel: Model<PrescriptionDocument>,
    private readonly doctorService: DoctorService,
  ) {}

  async create(dto: CreatePrescriptionDto) {
    const doctor = await this.doctorService.findOne(dto.doctor);
    return this.prescriptionModel.create({
      ...dto,
      merchant: doctor.merchant,
      patient: new Types.ObjectId(dto.patient),
      doctor: doctor._id,
      encounter: new Types.ObjectId(dto.encounter),
    });
  }

  async getByEncounter(encounterId: string) {
    return this.prescriptionModel
      .findOne({ encounter: new Types.ObjectId(encounterId) })
      .populate("patient doctor");
  }

  async getByPatient(patientId: string) {
    return this.prescriptionModel
      .find({ patient: new Types.ObjectId(patientId) })
      .sort({ createdAt: -1 })
      .populate("doctor", "name specialization");
  }

  async update(id: string, dto: UpdatePrescriptionDto) {
    const prescription = await this.prescriptionModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      dto,
      { new: true },
    );
    if (!prescription) throw new NotFoundException("Prescription not found");
    return prescription;
  }

  async updateStatus(id: string, status: PrescriptionStatus) {
    const prescription = await this.prescriptionModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { status },
      { new: true },
    );
    if (!prescription) throw new NotFoundException("Prescription not found");
    return prescription;
  }
}

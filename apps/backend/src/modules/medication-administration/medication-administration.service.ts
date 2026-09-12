import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { MedicationAdministrationDocument } from "./schema/medication-administration.schema";
import { CreateMedicationAdminDto } from "./dto/create-medication-admin.dto";
import { RecordAdministrationDto } from "./dto/record-administration.dto";
import { MedicationAdminStatus } from "../../constant/enums/status.enum";

@Injectable()
export class MedicationAdministrationService {
  constructor(
    @InjectModel(collectionsName.medicationAdministration)
    private readonly medicationAdminModel: Model<MedicationAdministrationDocument>,
  ) {}

  async create(dto: CreateMedicationAdminDto, merchantId: Types.ObjectId) {
    return this.medicationAdminModel.create({
      ...dto,
      patient: new Types.ObjectId(dto.patient),
      admission: new Types.ObjectId(dto.admission),
      prescription: dto.prescription
        ? new Types.ObjectId(dto.prescription)
        : null,
      scheduledTime: new Date(dto.scheduledTime),
      status: MedicationAdminStatus.SCHEDULED,
      merchant: merchantId,
      isActive: true,
    });
  }

  async recordAdministration(
    id: string,
    dto: RecordAdministrationDto,
    administeredById?: Types.ObjectId,
  ) {
    const record = await this.medicationAdminModel.findById(new Types.ObjectId(id));
    if (!record || !record.isActive) {
      throw new NotFoundException("Medication administration record not found");
    }

    if (
      (dto.status === MedicationAdminStatus.SKIPPED ||
        dto.status === MedicationAdminStatus.REFUSED) &&
      !dto.skippedReason
    ) {
      throw new BadRequestException(
        `A reason is required when a medication dose is ${dto.status.toLowerCase()}`,
      );
    }

    record.status = dto.status;
    record.actualTime = dto.actualTime ? new Date(dto.actualTime) : new Date();
    if (dto.skippedReason) record.skippedReason = dto.skippedReason;
    if (dto.notes) record.notes = dto.notes;
    if (administeredById) record.administeredBy = administeredById;

    return record.save();
  }

  async findAll(
    merchantId?: string,
    admissionId?: string,
    patientId?: string,
    prescriptionId?: string,
    status?: MedicationAdminStatus,
  ) {
    const filter: any = { isActive: true };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    if (admissionId) filter.admission = new Types.ObjectId(admissionId);
    if (patientId) filter.patient = new Types.ObjectId(patientId);
    if (prescriptionId) filter.prescription = new Types.ObjectId(prescriptionId);
    if (status) filter.status = status;

    return this.medicationAdminModel
      .find(filter)
      .populate("patient", "name phone gender age bloodGroup")
      .populate("admission", "admissionNumber room bed")
      .populate("administeredBy", "name role")
      .sort({ scheduledTime: 1 });
  }

  async findOne(id: string) {
    const record = await this.medicationAdminModel
      .findById(new Types.ObjectId(id))
      .populate("patient", "name phone gender age bloodGroup")
      .populate("admission", "admissionNumber room bed")
      .populate("prescription")
      .populate("administeredBy", "name role");

    if (!record) {
      throw new NotFoundException("Medication administration record not found");
    }
    return record;
  }

  async findByAdmission(admissionId: string, merchantId?: string) {
    const filter: any = {
      admission: new Types.ObjectId(admissionId),
      isActive: true,
    };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);

    return this.medicationAdminModel
      .find(filter)
      .populate("administeredBy", "name role")
      .sort({ scheduledTime: 1 });
  }

  async findByPatient(patientId: string, merchantId?: string) {
    const filter: any = {
      patient: new Types.ObjectId(patientId),
      isActive: true,
    };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);

    return this.medicationAdminModel
      .find(filter)
      .populate("administeredBy", "name role")
      .sort({ scheduledTime: -1 });
  }
}

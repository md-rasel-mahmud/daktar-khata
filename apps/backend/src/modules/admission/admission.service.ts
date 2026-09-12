import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Types, Connection } from "mongoose";
import { collectionsName } from "../../constant";
import { AdmissionDocument } from "./schema/admission.schema";
import { CreateAdmissionDto } from "./dto/create-admission.dto";
import { DischargeDto } from "./dto/discharge.dto";
import { AdmissionStatus, BedStatus } from "src/constant/enums/status.enum";
import { DoctorService } from "../doctor/doctor.service";
import { BedDocument } from "../bed/schema/bed.schema";
import { BedAllocationDocument } from "../bed-allocation/schema/bed-allocation.schema";

@Injectable()
export class AdmissionService {
  constructor(
    @InjectModel(collectionsName.admission)
    private readonly admissionModel: Model<AdmissionDocument>,
    @InjectModel(collectionsName.bed)
    private readonly bedModel: Model<BedDocument>,
    @InjectModel(collectionsName.bedAllocation)
    private readonly allocationModel: Model<BedAllocationDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly doctorService: DoctorService,
  ) {}

  async create(dto: CreateAdmissionDto, userId: Types.ObjectId) {
    const doctor = await this.doctorService.findOne(dto.doctor);
    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const admissionData: any = {
        ...dto,
        merchant: doctor.merchant,
        patient: new Types.ObjectId(dto.patient),
        doctor: doctor._id,
        status: AdmissionStatus.ADMITTED,
      };

      // Convert ObjectId fields
      if (dto.clinic) admissionData.clinic = new Types.ObjectId(dto.clinic);
      if (dto.ward) admissionData.ward = new Types.ObjectId(dto.ward);
      if (dto.room) admissionData.room = new Types.ObjectId(dto.room);
      if (dto.bed) admissionData.bed = new Types.ObjectId(dto.bed);
      if (dto.responsibleStaff) admissionData.responsibleStaff = new Types.ObjectId(dto.responsibleStaff);

      const [admission] = await this.admissionModel.create([admissionData], { session });

      // Auto-allocate bed if provided
      if (dto.bed) {
        const bed = await this.bedModel.findById(new Types.ObjectId(dto.bed)).session(session);
        if (!bed) throw new NotFoundException("Bed not found");
        if (bed.status !== BedStatus.AVAILABLE) {
          throw new BadRequestException(
            `Bed is currently ${bed.status}. Only AVAILABLE beds can be allocated.`,
          );
        }

        bed.status = BedStatus.OCCUPIED;
        await bed.save({ session });

        await this.allocationModel.create(
          [
            {
              bed: bed._id,
              patient: new Types.ObjectId(dto.patient),
              admission: admission._id,
              merchant: doctor.merchant,
              allocatedBy: userId,
            },
          ],
          { session },
        );
      }

      await session.commitTransaction();
      return admission;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findAll(status?: string, doctorId?: string, merchantId?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    if (doctorId) filter.doctor = new Types.ObjectId(doctorId);
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    return this.admissionModel
      .find(filter)
      .sort({ admissionDate: -1 })
      .populate("patient", "name phone")
      .populate("doctor", "name specialization")
      .populate("ward", "name")
      .populate("room", "name")
      .populate("bed", "bedNumber");
  }

  async findOne(id: string) {
    const admission = await this.admissionModel
      .findById(new Types.ObjectId(id))
      .populate("patient doctor ward room bed responsibleStaff");
    if (!admission) throw new NotFoundException("Admission not found");
    return admission;
  }

  async getByPatient(patientId: string) {
    return this.admissionModel
      .find({ patient: new Types.ObjectId(patientId) })
      .sort({ admissionDate: -1 })
      .populate("doctor", "name specialization")
      .populate("ward", "name")
      .populate("bed", "bedNumber");
  }

  async updateStatus(id: string, status: AdmissionStatus) {
    const admission = await this.admissionModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { status },
      { new: true },
    );
    if (!admission) throw new NotFoundException("Admission not found");
    return admission;
  }

  async discharge(id: string, dto: DischargeDto, userId: Types.ObjectId) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const admission = await this.admissionModel.findById(new Types.ObjectId(id)).session(session);
      if (!admission) throw new NotFoundException("Admission not found");
      if (admission.status === AdmissionStatus.DISCHARGED) {
        throw new BadRequestException("Patient is already discharged");
      }

      admission.status = AdmissionStatus.DISCHARGED;
      admission.actualDischargeDate = new Date();
      if (dto.dischargeNotes) admission.dischargeNotes = dto.dischargeNotes;
      await admission.save({ session });

      // Release bed allocation
      if (admission.bed) {
        const activeAllocation = await this.allocationModel.findOne({
          admission: admission._id,
          isActive: true,
        }).session(session);

        if (activeAllocation) {
          activeAllocation.isActive = false;
          activeAllocation.releasedAt = new Date();
          activeAllocation.releasedBy = userId;
          await activeAllocation.save({ session });

          await this.bedModel.findByIdAndUpdate(
            activeAllocation.bed,
            { status: BedStatus.AVAILABLE },
            { session },
          );
        }
      }

      await session.commitTransaction();
      return { message: "Patient discharged successfully", admission };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

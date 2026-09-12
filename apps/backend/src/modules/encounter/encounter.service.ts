import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { EncounterDocument } from "./schema/encounter.schema";
import { CreateEncounterDto } from "./dto/create-encounter.dto";
import { UpdateEncounterDto } from "./dto/update-encounter.dto";
import { DoctorService } from "../doctor/doctor.service";

@Injectable()
export class EncounterService {
  constructor(
    @InjectModel(collectionsName.encounter)
    private readonly encounterModel: Model<EncounterDocument>,
    private readonly doctorService: DoctorService,
  ) {}

  async create(dto: CreateEncounterDto, userId: Types.ObjectId) {
    const doctor = await this.doctorService.findOne(dto.doctor);
    
    return this.encounterModel.create({
      ...dto,
      merchant: doctor.merchant,
      doctor: doctor._id,
      patient: new Types.ObjectId(dto.patient),
      ...(dto.appointment && { appointment: new Types.ObjectId(dto.appointment) }),
    });
  }

  async getByAppointment(appointmentId: string) {
    return this.encounterModel
      .findOne({ appointment: new Types.ObjectId(appointmentId) })
      .populate("patient doctor");
  }

  async getByPatient(patientId: string) {
    return this.encounterModel
      .find({ patient: new Types.ObjectId(patientId) })
      .sort({ encounterDate: -1 })
      .populate("doctor", "name specialization");
  }

  async update(id: string, dto: UpdateEncounterDto) {
    const encounter = await this.encounterModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      dto,
      { new: true }
    );
    if (!encounter) throw new NotFoundException("Encounter not found");
    return encounter;
  }
}

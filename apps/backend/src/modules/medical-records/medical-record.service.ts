import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { Patient } from "../patient/schema/patient.schema";
import { Doctor } from "../doctor/schema/doctor.schema";
import {
  MedicalRecord,
  MedicalRecordDocument,
} from "./schema/medical-record.schema";
import { CreateMedicalRecordDto } from "./dto/create-medical-record.dto";
import { UpdateMedicalRecordDto } from "./dto/update-medical-record.dto";

@Injectable()
export class MedicalRecordService {
  constructor(
    @InjectModel(collectionsName.medicalRecord)
    private readonly medicalRecordModel: Model<MedicalRecordDocument>,
    @InjectModel(collectionsName.patient)
    private readonly patientModel: Model<Patient>,
    @InjectModel(collectionsName.doctor)
    private readonly doctorModel: Model<Doctor>,
  ) {}

  private async resolvePatient(patientIdentifier: string) {
    if (!Types.ObjectId.isValid(patientIdentifier)) {
      throw new NotFoundException("Invalid patient ID");
    }

    const patientById = await this.patientModel
      .findById(patientIdentifier)
      .exec();
    if (patientById) return patientById;

    const patientByUserId = await this.patientModel
      .findOne({ user: new Types.ObjectId(patientIdentifier) })
      .exec();
    if (patientByUserId) return patientByUserId;

    throw new NotFoundException("Patient not found");
  }

  private async resolveDoctor(doctorIdentifier: string) {
    if (!Types.ObjectId.isValid(doctorIdentifier)) {
      throw new NotFoundException("Invalid doctor ID");
    }

    const doctor = await this.doctorModel.findById(doctorIdentifier).exec();
    if (doctor) return doctor;

    const doctorByUserId = await this.doctorModel
      .findOne({ user: new Types.ObjectId(doctorIdentifier) })
      .exec();
    if (doctorByUserId) return doctorByUserId;

    throw new NotFoundException("Doctor not found");
  }

  private toView(record: any) {
    const patient = record.patient || {};
    const doctor = record.doctor || {};

    return {
      id: String(record._id),
      patientId: String(patient._id || record.patient || ""),
      patientName: patient.name || "Patient",
      doctorId: String(doctor._id || record.doctor || ""),
      doctorName: doctor.name || "Doctor",
      appointmentId: record.appointment
        ? String(record.appointment)
        : undefined,
      date: record.date,
      diagnosis: record.diagnosis,
      prescription: record.prescription || [],
      notes: record.notes,
      followUpDate: record.followUpDate,
      recordedBy: record.recordedBy,
      merchant: record.merchant,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async create(dto: CreateMedicalRecordDto) {
    const patient = await this.resolvePatient(dto.patientId);
    const doctor = await this.resolveDoctor(dto.doctorId);

    const record = await this.medicalRecordModel.create({
      patient: patient._id,
      doctor: doctor._id,
      appointment: dto.appointmentId
        ? new Types.ObjectId(dto.appointmentId)
        : undefined,
      date: dto.date ? new Date(dto.date) : new Date(),
      diagnosis: dto.diagnosis,
      prescription: dto.prescription || [],
      notes: dto.notes,
      followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
      recordedBy: dto.recordedBy,
    });

    return this.findById(String(record._id));
  }

  async findAll() {
    const records = await this.medicalRecordModel
      .find()
      .populate("patient", "name email phone gender dob address medicalHistory")
      .populate("doctor", "name specialization fee")
      .sort({ date: -1 })
      .exec();

    return records.map((record) => this.toView(record));
  }

  async findByPatient(patientIdentifier: string) {
    const patient = await this.resolvePatient(patientIdentifier);

    const records = await this.medicalRecordModel
      .find({ patient: patient._id })
      .populate("patient", "name email phone gender dob address medicalHistory")
      .populate("doctor", "name specialization fee")
      .sort({ date: -1 })
      .exec();

    return records.map((record) => this.toView(record));
  }

  async findById(recordId: string) {
    if (!Types.ObjectId.isValid(recordId)) {
      throw new NotFoundException("Invalid medical record ID");
    }

    const record = await this.medicalRecordModel
      .findById(recordId)
      .populate("patient", "name email phone gender dob address medicalHistory")
      .populate("doctor", "name specialization fee")
      .exec();

    if (!record) {
      throw new NotFoundException("Medical record not found");
    }

    return this.toView(record);
  }

  async update(recordId: string, dto: UpdateMedicalRecordDto) {
    if (!Types.ObjectId.isValid(recordId)) {
      throw new NotFoundException("Invalid medical record ID");
    }

    const updatePayload: Record<string, any> = { ...dto };
    if (dto.patientId) {
      const patient = await this.resolvePatient(dto.patientId);
      updatePayload.patient = patient._id;
      delete updatePayload.patientId;
    }
    if (dto.doctorId) {
      const doctor = await this.resolveDoctor(dto.doctorId);
      updatePayload.doctor = doctor._id;
      delete updatePayload.doctorId;
    }
    if (dto.appointmentId) {
      updatePayload.appointment = new Types.ObjectId(dto.appointmentId);
      delete updatePayload.appointmentId;
    }
    if (dto.date) {
      updatePayload.date = new Date(dto.date);
    }
    if (dto.followUpDate) {
      updatePayload.followUpDate = new Date(dto.followUpDate);
    }

    const updated = await this.medicalRecordModel
      .findByIdAndUpdate(recordId, updatePayload, { new: true })
      .populate("patient", "name email phone gender dob address medicalHistory")
      .populate("doctor", "name specialization fee")
      .exec();

    if (!updated) {
      throw new NotFoundException("Medical record not found");
    }

    return this.toView(updated);
  }

  async remove(recordId: string) {
    if (!Types.ObjectId.isValid(recordId)) {
      throw new NotFoundException("Invalid medical record ID");
    }

    const deleted = await this.medicalRecordModel
      .findByIdAndDelete(recordId)
      .exec();
    if (!deleted) {
      throw new NotFoundException("Medical record not found");
    }

    return this.toView(deleted);
  }
}

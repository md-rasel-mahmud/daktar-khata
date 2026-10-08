import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model, Types } from "mongoose";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { collectionsName, RolesEnum } from "../../constant";
import { Patient } from "./schema/patient.schema";
import { AppointmentDocument } from "../appointment/schema/appointment.schema";
import { Doctor } from "../doctor/schema/doctor.schema";
import { AppointmentStatus } from "../../constant/enums/status.enum";

type PatientWithAppointments = Patient & {
  appointments: Array<Record<string, any>>;
};

type MedicalRecordView = {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  diagnosis: string;
  prescription: string[];
  notes?: string;
  followUpDate?: Date;
};

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(collectionsName.patient) private patientModel: Model<Patient>,
    @InjectModel(collectionsName.appointment)
    private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(collectionsName.doctor)
    private readonly doctorModel: Model<Doctor>,
  ) {}

  async create(
    createPatientDto: CreatePatientDto,
    session?: ClientSession,
  ): Promise<Patient> {
    const patient = new this.patientModel(createPatientDto);
    return patient.save({ session });
  }

  private async findPatientByIdentifier(identifier: string): Promise<Patient> {
    if (!Types.ObjectId.isValid(identifier)) {
      throw new NotFoundException("Invalid patient ID");
    }

    const patientById = await this.patientModel
      .findById(identifier)
      .populate("user", "-password -createdAt -updatedAt")
      .exec();

    if (patientById) {
      return patientById;
    }

    const patientByUserId = await this.patientModel
      .findOne({ user: new Types.ObjectId(identifier) })
      .populate("user", "-password -createdAt -updatedAt")
      .exec();

    if (patientByUserId) {
      return patientByUserId;
    }

    throw new NotFoundException("Patient not found");
  }

  private normalizePrescriptionNotes(prescriptionNotes?: string | null) {
    if (!prescriptionNotes) {
      return [];
    }

    return prescriptionNotes
      .split(/\r?\n|;|\|/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private normalizeMedicalRecord(appointment: any): MedicalRecordView | null {
    const diagnosis =
      appointment.diagnosis || appointment.reasonFor || appointment.note;
    const prescription = this.normalizePrescriptionNotes(
      appointment.prescriptionNotes,
    );

    if (!diagnosis && prescription.length === 0 && !appointment.note) {
      return null;
    }

    const patient = appointment.patient || {};
    const doctor = appointment.doctor || {};

    return {
      id: String(appointment._id),
      appointmentId: String(appointment._id),
      patientId: String(patient._id || appointment.patient || ""),
      patientName: patient.name || appointment.patientName || "Patient",
      doctorId: String(doctor._id || appointment.doctor || ""),
      doctorName: doctor.name || appointment.doctorName || "Doctor",
      date: appointment.completedAt || appointment.appointmentDate,
      diagnosis: diagnosis || "Consultation",
      prescription,
      notes: appointment.note || appointment.problemDescription || undefined,
      followUpDate: appointment.followUpDate,
    };
  }

  async findAll(): Promise<Patient[]> {
    return this.patientModel.find().populate("user", "-password").exec();
  }

  async findDoctorPatients(
    doctorUserId: Types.ObjectId,
  ): Promise<PatientWithAppointments[]> {
    // Support both token payload variants: user id and doctor profile id.
    let doctor = await this.doctorModel.findOne({ user: doctorUserId }).exec();

    if (!doctor) {
      doctor = await this.doctorModel.findById(doctorUserId).exec();
    }

    if (!doctor) {
      throw new NotFoundException("Doctor not found");
    }

    const appointments = await this.appointmentModel
      .find({ doctor: { $in: [doctor._id, doctorUserId] } })
      .populate("patient")
      .populate("doctor", "name specialization")
      .sort({ appointmentDate: -1 })
      .exec();

    const patientMap = new Map<string, PatientWithAppointments>();

    for (const appointment of appointments) {
      const patient = appointment.patient as unknown as Patient | null;
      if (!patient) continue;

      const patientId = String((patient as any)._id || (patient as any).id);
      const existing = patientMap.get(patientId);
      const normalizedAppointment = {
        id: String((appointment as any)._id),
        appointmentDate: appointment.appointmentDate,
        appointmentSlot: appointment.appointmentSlot,
        reasonFor: appointment.reasonFor,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        paymentMethod: appointment.paymentMethod,
        createdAt: (appointment as any).createdAt,
        doctor: appointment.doctor,
      };

      if (existing) {
        existing.appointments.push(normalizedAppointment);
        continue;
      }

      const patientObject = patient.toObject
        ? patient.toObject()
        : ({ ...patient } as Patient);

      patientMap.set(patientId, {
        ...patientObject,
        id: patientId,
        appointments: [normalizedAppointment],
      } as PatientWithAppointments);
    }

    return Array.from(patientMap.values());
  }

  async findPatientAppointments(patientIdentifier: string) {
    const patient = await this.findPatientByIdentifier(patientIdentifier);

    return this.appointmentModel
      .find({ patient: new Types.ObjectId(String(patient._id)) })
      .populate("doctor", "name specialization fee")
      .sort({ appointmentDate: -1 })
      .exec();
  }

  async findPatientMedicalRecords(patientIdentifier: string) {
    const patient = await this.findPatientByIdentifier(patientIdentifier);

    const appointments = await this.appointmentModel
      .find({
        patient: new Types.ObjectId(String(patient._id)),
        $or: [
          { status: AppointmentStatus.COMPLETED },
          { diagnosis: { $exists: true, $nin: [null, ""] } },
          { prescriptionNotes: { $exists: true, $nin: [null, ""] } },
        ],
      })
      .populate(
        "patient",
        "name email mobile address note gender status medicalHistory currentMedications lastVisited user",
      )
      .populate("doctor", "name specialization fee")
      .sort({ completedAt: -1, appointmentDate: -1 })
      .exec();

    return appointments
      .map((appointment) => this.normalizeMedicalRecord(appointment))
      .filter(Boolean)
      .sort(
        (a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime(),
      );
  }

  async findPatientById(patientId: string) {
    return this.findPatientByIdentifier(patientId);
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientModel.findById(id).populate("profile");
    if (!patient) {
      throw new NotFoundException("Patient not found");
    }
    return patient;
  }

  async findOneByUserId(userId: Types.ObjectId): Promise<Patient> {
    const patient = await this.patientModel
      .findOne({ user: userId })
      .populate("user", "-password -createdAt -updatedAt");

    if (!patient) {
      throw new NotFoundException("User not found");
    }
    return patient;
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
    session?: ClientSession,
  ): Promise<Patient> {
    const updated = await this.patientModel
      .findByIdAndUpdate(id, updatePatientDto, { new: true })
      .populate("profile")
      .session(session);

    if (!updated) {
      throw new NotFoundException("Patient not found for update");
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.patientModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException("Patient not found for delete");
    }
  }
}

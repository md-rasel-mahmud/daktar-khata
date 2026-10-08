import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName, PermissionKeyEnum, RolesEnum } from "../../constant";
import {
  AppointmentStatus,
  QueueStatus,
} from "../../constant/enums/status.enum";
import { IAuthUser } from "../../common";
import { AppointmentDocument } from "./schema/appointment.schema";
import { Doctor } from "../doctor/schema/doctor.schema";
import { MerchantDocument } from "../merchant/schema/merchant.schema";
import { QueueGateway } from "../queue/queue.gateway";

/**
 * Explicit, server-authoritative queue transitions (roadmap §9).
 * Anything not listed here is rejected.
 */
export const QUEUE_TRANSITIONS: Record<QueueStatus, QueueStatus[]> = {
  [QueueStatus.WAITING]: [
    QueueStatus.CALLED,
    QueueStatus.SKIPPED,
    QueueStatus.CANCELLED,
  ],
  [QueueStatus.CALLED]: [
    QueueStatus.IN_CONSULTATION,
    QueueStatus.SKIPPED,
    QueueStatus.WAITING,
  ],
  [QueueStatus.IN_CONSULTATION]: [QueueStatus.COMPLETED],
  [QueueStatus.SKIPPED]: [QueueStatus.WAITING, QueueStatus.CANCELLED],
  [QueueStatus.COMPLETED]: [],
  [QueueStatus.CANCELLED]: [],
};

/** Used for ETA when no consultation has completed yet today. */
const DEFAULT_CONSULTATION_MINUTES = 10;

type DoctorDoc = Doctor & { _id: Types.ObjectId };

export interface PublicQueueSnapshot {
  doctorId: string;
  doctorName: string;
  specialization: string[];
  clinicName: string;
  date: string;
  current: { serial: number; status: QueueStatus } | null;
  next: { serial: number } | null;
  waitingCount: number;
  completedCount: number;
  /** Serials still ahead in line, in service order. Serials only – no patient data. */
  waitingSerials: number[];
  avgConsultationMinutes: number;
  estimatedWaitMinutes: number;
  updatedAt: string;
}

@Injectable()
export class AppointmentQueueService {
  constructor(
    @InjectModel(collectionsName.appointment)
    private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(collectionsName.doctor)
    private readonly doctorModel: Model<Doctor>,
    @InjectModel(collectionsName.merchant)
    private readonly merchantModel: Model<MerchantDocument>,
    private readonly queueGateway: QueueGateway,
  ) {}

  // ---------------------------------------------------------------------------
  // Access control
  // ---------------------------------------------------------------------------

  /**
   * Resolve which doctor's queue the caller may operate on.
   * - DOCTOR: only their own queue.
   * - MERCHANT / STAFF: any doctor in their tenant (staff need `appointment.queue.manage`).
   * - ADMIN / SUPER_ADMIN: any doctor.
   */
  async resolveDoctorForUser(
    authUser: IAuthUser,
    doctorId?: string,
  ): Promise<DoctorDoc> {
    if (doctorId && !Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException("Invalid doctorId");
    }

    if (authUser.role === RolesEnum.DOCTOR) {
      const own = (await this.doctorModel
        .findOne({ user: new Types.ObjectId(authUser._id) })
        .lean()) as DoctorDoc;
      if (!own) throw new NotFoundException("Doctor profile not found");
      if (doctorId && own._id.toString() !== doctorId) {
        throw new ForbiddenException("You can only manage your own queue");
      }
      return own;
    }

    if (authUser.role === RolesEnum.STAFF) {
      const perms = authUser.permissions || [];
      if (!perms.includes(PermissionKeyEnum.APPOINTMENT_QUEUE_MANAGE)) {
        throw new ForbiddenException(
          `Missing permission: ${PermissionKeyEnum.APPOINTMENT_QUEUE_MANAGE}`,
        );
      }
    }

    if (!doctorId) throw new BadRequestException("doctorId is required");

    const doctor = (await this.doctorModel
      .findById(doctorId)
      .lean()) as DoctorDoc;
    if (!doctor) throw new NotFoundException("Doctor not found");

    const isPlatformAdmin = [RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN].includes(
      authUser.role as RolesEnum,
    );
    if (
      !isPlatformAdmin &&
      (!authUser.merchant ||
        doctor.merchant?.toString() !== authUser.merchant.toString())
    ) {
      throw new ForbiddenException("Doctor does not belong to your clinic");
    }

    return doctor;
  }

  /** Load an appointment and ensure the caller may operate on its doctor's queue. */
  private async loadAppointmentForUser(
    authUser: IAuthUser,
    appointmentId: string,
  ) {
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException("Invalid appointment ID");
    }
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) throw new NotFoundException("Appointment not found");

    await this.resolveDoctorForUser(authUser, appointment.doctor.toString());
    return appointment;
  }

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  private todayRange(date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  /** Sort: emergency first, then serial ascending. */
  private sortQueue<T extends { isEmergency?: boolean; serialNumber?: number }>(
    items: T[],
  ): T[] {
    return [...items].sort((a, b) => {
      const e = Number(!!b.isEmergency) - Number(!!a.isEmergency);
      if (e !== 0) return e;
      return (a.serialNumber ?? 0) - (b.serialNumber ?? 0);
    });
  }

  private async findTodayAppointments(doctorId: Types.ObjectId) {
    const { start, end } = this.todayRange();
    return this.appointmentModel
      .find({
        doctor: doctorId,
        appointmentDate: { $gte: start, $lte: end },
        status: { $nin: [AppointmentStatus.CANCELLED] },
      })
      .lean();
  }

  /** Full queue for the doctor / reception (authenticated). */
  async getTodayQueue(authUser: IAuthUser, doctorId?: string) {
    const doctor = await this.resolveDoctorForUser(authUser, doctorId);
    const { start, end } = this.todayRange();

    const appointments = await this.appointmentModel
      .find({
        doctor: doctor._id,
        appointmentDate: { $gte: start, $lte: end },
        status: { $nin: [AppointmentStatus.CANCELLED] },
      })
      .populate("patient", "name mobile gender bloodGroup")
      .select("-rescheduleHistory -transactionId")
      .lean();

    const sorted = this.sortQueue(appointments);
    const count = (s: QueueStatus) =>
      sorted.filter((a) => (a.queueStatus || QueueStatus.WAITING) === s).length;

    const current =
      sorted.find((a) => a.queueStatus === QueueStatus.IN_CONSULTATION) ||
      sorted.find((a) => a.queueStatus === QueueStatus.CALLED) ||
      null;

    return {
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
      },
      date: start.toISOString(),
      current,
      items: sorted,
      stats: {
        total: sorted.length,
        waiting: count(QueueStatus.WAITING),
        called: count(QueueStatus.CALLED),
        inConsultation: count(QueueStatus.IN_CONSULTATION),
        completed: count(QueueStatus.COMPLETED),
        skipped: count(QueueStatus.SKIPPED),
      },
      avgConsultationMinutes: this.averageConsultationMinutes(appointments),
    };
  }

  private averageConsultationMinutes(
    appointments: { consultationStartedAt?: Date; completedAt?: Date }[],
  ) {
    const durations = appointments
      .filter((a) => a.consultationStartedAt && a.completedAt)
      .map(
        (a) =>
          (new Date(a.completedAt).getTime() -
            new Date(a.consultationStartedAt).getTime()) /
          60000,
      )
      .filter((m) => m > 0 && m < 240);
    if (!durations.length) return DEFAULT_CONSULTATION_MINUTES;
    const avg = durations.reduce((s, m) => s + m, 0) / durations.length;
    return Math.max(1, Math.round(avg));
  }

  /**
   * Public, unauthenticated snapshot (roadmap §10).
   * Contains NO patient identity, contact, medical or payment data.
   */
  async getPublicSnapshot(doctorId: string): Promise<PublicQueueSnapshot> {
    if (!Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException("Invalid doctorId");
    }
    const doctor = (await this.doctorModel
      .findById(doctorId)
      .select("name specialization merchant")
      .lean()) as DoctorDoc;
    if (!doctor) throw new NotFoundException("Doctor not found");

    const merchant = await this.merchantModel
      .findById(doctor.merchant)
      .select("clinicName")
      .lean();

    const appointments = this.sortQueue(
      await this.findTodayAppointments(doctor._id),
    );

    const current =
      appointments.find((a) => a.queueStatus === QueueStatus.IN_CONSULTATION) ||
      appointments.find((a) => a.queueStatus === QueueStatus.CALLED) ||
      null;

    const ahead = appointments.filter(
      (a) =>
        a._id.toString() !== current?._id.toString() &&
        [QueueStatus.CALLED, QueueStatus.WAITING].includes(
          (a.queueStatus || QueueStatus.WAITING) as QueueStatus,
        ),
    );
    // Called patients are served before waiting ones.
    const ordered = [
      ...ahead.filter((a) => a.queueStatus === QueueStatus.CALLED),
      ...ahead.filter((a) => a.queueStatus !== QueueStatus.CALLED),
    ];

    const avg = this.averageConsultationMinutes(appointments);
    const completedCount = appointments.filter(
      (a) => a.queueStatus === QueueStatus.COMPLETED,
    ).length;

    return {
      doctorId: doctor._id.toString(),
      doctorName: doctor.name,
      specialization: doctor.specialization || [],
      clinicName: merchant?.clinicName || "",
      date: this.todayRange().start.toISOString(),
      current: current
        ? {
            serial: current.serialNumber,
            status: current.queueStatus as QueueStatus,
          }
        : null,
      next: ordered[0] ? { serial: ordered[0].serialNumber } : null,
      waitingCount: ordered.length,
      completedCount,
      waitingSerials: ordered.map((a) => a.serialNumber),
      avgConsultationMinutes: avg,
      estimatedWaitMinutes: ordered.length * avg,
      updatedAt: new Date().toISOString(),
    };
  }

  // ---------------------------------------------------------------------------
  // Commands
  // ---------------------------------------------------------------------------

  async updateQueueStatus(
    authUser: IAuthUser,
    appointmentId: string,
    nextStatus: QueueStatus,
  ) {
    if (!Object.values(QueueStatus).includes(nextStatus)) {
      throw new BadRequestException("Invalid queue status");
    }
    const appointment = await this.loadAppointmentForUser(
      authUser,
      appointmentId,
    );
    return this.applyTransition(authUser, appointment, nextStatus);
  }

  /** Server picks the next patient (emergency first, then serial) and marks them CALLED. */
  async callNext(authUser: IAuthUser, doctorId?: string) {
    const doctor = await this.resolveDoctorForUser(authUser, doctorId);
    const today = this.sortQueue(await this.findTodayAppointments(doctor._id));

    const busy = today.find(
      (a) =>
        a.queueStatus === QueueStatus.IN_CONSULTATION ||
        a.queueStatus === QueueStatus.CALLED,
    );
    if (busy) {
      throw new ConflictException(
        `Serial #${busy.serialNumber} is still ${busy.queueStatus}. Complete or skip it first.`,
      );
    }

    const next = today.find(
      (a) => (a.queueStatus || QueueStatus.WAITING) === QueueStatus.WAITING,
    );
    if (!next) throw new NotFoundException("No patients waiting in the queue");

    const doc = await this.appointmentModel.findById(next._id);
    return this.applyTransition(authUser, doc, QueueStatus.CALLED);
  }

  async setEmergency(
    authUser: IAuthUser,
    appointmentId: string,
    isEmergency: boolean,
  ) {
    const appointment = await this.loadAppointmentForUser(
      authUser,
      appointmentId,
    );
    appointment.isEmergency = !!isEmergency;
    await appointment.save();
    await this.broadcast(appointment.doctor);
    return { message: "Emergency flag updated", appointment };
  }

  async checkIn(authUser: IAuthUser, appointmentId: string) {
    const appointment = await this.loadAppointmentForUser(
      authUser,
      appointmentId,
    );
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException("Cannot check in a cancelled appointment");
    }
    if (!appointment.checkedInAt) {
      appointment.checkedInAt = new Date();
      await appointment.save();
    }
    await this.broadcast(appointment.doctor);
    return { message: "Patient checked in", appointment };
  }

  /** Keep the queue in sync when an appointment itself is cancelled. */
  async syncCancelled(appointment: AppointmentDocument) {
    await this.broadcast(appointment.doctor);
  }

  private async applyTransition(
    authUser: IAuthUser,
    appointment: AppointmentDocument,
    nextStatus: QueueStatus,
  ) {
    const current = (appointment.queueStatus ||
      QueueStatus.WAITING) as QueueStatus;
    const allowed = QUEUE_TRANSITIONS[current] || [];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(
        `Cannot move from ${current} to ${nextStatus}`,
      );
    }

    if (nextStatus === QueueStatus.IN_CONSULTATION) {
      const { start, end } = this.todayRange();
      const other = await this.appointmentModel.exists({
        _id: { $ne: appointment._id },
        doctor: appointment.doctor,
        appointmentDate: { $gte: start, $lte: end },
        queueStatus: QueueStatus.IN_CONSULTATION,
      });
      if (other) {
        throw new ConflictException(
          "Another patient is already in consultation",
        );
      }
    }

    const now = new Date();
    const set: Record<string, unknown> = { queueStatus: nextStatus };
    switch (nextStatus) {
      case QueueStatus.CALLED:
        set.calledAt = now;
        break;
      case QueueStatus.IN_CONSULTATION:
        set.consultationStartedAt = now;
        break;
      case QueueStatus.COMPLETED:
        set.status = AppointmentStatus.COMPLETED;
        set.completedAt = now;
        break;
      case QueueStatus.CANCELLED:
        set.status = AppointmentStatus.CANCELLED;
        set.cancelledAt = now;
        set.cancelledBy = new Types.ObjectId(authUser._id);
        break;
    }

    // Conditional update: fails if someone else changed the status meanwhile.
    const updated = await this.appointmentModel.findOneAndUpdate(
      {
        _id: appointment._id,
        queueStatus: appointment.queueStatus ?? { $in: [null, QueueStatus.WAITING] },
      },
      {
        $set: set,
        $push: {
          queueHistory: {
            from: current,
            to: nextStatus,
            changedBy: new Types.ObjectId(authUser._id),
            changedAt: now,
          },
        },
      },
      { new: true },
    );
    if (!updated) {
      throw new ConflictException(
        "Queue was updated by someone else. Please refresh.",
      );
    }

    await this.broadcast(updated.doctor);

    return {
      message: `Queue status updated to ${nextStatus}`,
      appointment: updated,
    };
  }

  /** Push the sanitized public snapshot to everyone watching this doctor. */
  async broadcast(doctorId: Types.ObjectId | string) {
    try {
      const snapshot = await this.getPublicSnapshot(doctorId.toString());
      this.queueGateway.emitQueueUpdate(doctorId.toString(), snapshot);
    } catch {
      // Realtime is best-effort; clients also poll.
    }
  }
}

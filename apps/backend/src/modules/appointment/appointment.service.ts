import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Types, Connection } from "mongoose";
import { collectionsName } from "../../constant";
import { AppointmentDocument } from "./schema/appointment.schema";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { UpdateAppointmentStatusDto } from "./dto/update-appointment-status.dto";
import { RescheduleAppointmentDto } from "./dto/reschedule-appointment.dto";
import { PaymentService } from "../payment/payment.service";
import {
  PaymentMethod,
  PaymentStatus,
  AppointmentStatus,
} from "src/constant/enums/status.enum";
import { PatientService } from "src/modules/patient/patient.service";
import { DoctorService } from "src/modules/doctor/doctor.service";
import { BillingForEnum } from "src/constant/enums/billing-for.enum";
import { MerchantPGService } from "src/modules/merchant-pg/merchant-pg.service";
import { Doctor } from "src/modules/doctor/schema/doctor.schema";
import { QueueGateway } from "../queue/queue.gateway";
import { QueueStatus } from "src/constant/enums/status.enum";

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(collectionsName.appointment)
    private readonly appointmentModel: Model<AppointmentDocument>,

    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,

    private readonly patientService: PatientService,
    private readonly doctorService: DoctorService,
    private readonly merchantPgService: MerchantPGService,
    @InjectConnection() private readonly connection: Connection,
    private readonly queueGateway: QueueGateway,
  ) {}

  /**
   * Create appointment for a patient.
   * If payment method = 'cash' => COMPLETED
   * Else => PENDING and initiate SSLCommerz payment
   */
  async createAppointment(userId: Types.ObjectId, dto: CreateAppointmentDto) {
    const isSlotAvailable = await this.validateSlot(
      dto.doctor,
      dto.appointmentDate,
      dto.appointmentSlot,
    );

    if (!isSlotAvailable) {
      throw new BadRequestException("The requested slot is not available. Please choose another time.");
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      let paymentStatus = PaymentStatus.PENDING;

      // Step 1: check payment method
      if (dto.paymentMethod === PaymentMethod.CASH) {
        paymentStatus = PaymentStatus.COMPLETED;
      }

      const patient = await this.patientService.findOneByUserId(userId);
      const doctor = await this.doctorService.findOne(dto.doctor);
      const transactionId = `TXN_${Date.now()}`;

      // Calculate serial number
      const reqDate = new Date(dto.appointmentDate);
      const startOfDay = new Date(reqDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(reqDate);
      endOfDay.setHours(23, 59, 59, 999);

      const appointmentCount = await this.appointmentModel.countDocuments({
        doctor: doctor._id,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      }).session(session);

      const serialNumber = appointmentCount + 1;

      // Step 2: create appointment
      const createdAppointments = await this.appointmentModel.create(
        [
          {
            ...dto,
            merchant: doctor.merchant,
            paymentStatus,
            transactionId,
            patient: patient._id,
            doctor: doctor._id,
            serialNumber,
          },
        ],
        { session }
      );
      const createdAppointment = createdAppointments[0];

      // Step 3: if not cash, initiate payment
      if (dto.paymentMethod === PaymentMethod.SSL_COMMERZ) {
        const paymentPayload = {
          amount: doctor.fee,
          paymentId: createdAppointment._id.toString(),
          transactionId,
        };

        const customerPayload = {
          customerName: patient.name,
          customerAddress: patient.address || "N/A",
          customerEmail: patient.user?.["email"] || "unknown@mail.com",
          customerPhone: patient.user["phone"],
        };

        const merchantPG = await this.merchantPgService.getSinglePG(
          new Types.ObjectId(doctor.merchant),
        );

        if (!merchantPG || !merchantPG.sslcommerz.isActive) {
          throw new BadRequestException(
            "SSLCOMMERZ Payment Gateway is not configured for this merchant or inactive. Try cash payment method.",
          );
        }

        const paymentInit = await this.paymentService.initiate(
          paymentPayload,
          customerPayload,
          BillingForEnum.PATIENT_APPOINTMENT,
        );

        await session.commitTransaction();
        session.endSession();

        return {
          message: "Appointment created successfully. Please complete payment.",
          data: {
            appointment: createdAppointment,
            payment: paymentInit,
          },
        };
      }

      // Step 4: if cash, no payment needed
      await session.commitTransaction();
      session.endSession();

      return {
        message: "Appointment created successfully (Cash payment).",
        appointment: createdAppointment,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getAppointmentByTransactionId(transactionId: string) {
    const appointment = await this.appointmentModel
      .findOne({ transactionId })
      .populate("doctor patient");
    if (!appointment) throw new NotFoundException("Appointment not found");
    return appointment;
  }

  async updateForMerchant(
    merchantId: Types.ObjectId,
    appointmentId: Types.ObjectId,
    dto: UpdateAppointmentDto,
  ) {
    const appointment = await this.appointmentModel.findOneAndUpdate(
      { _id: appointmentId, merchant: merchantId },
      dto,
      { new: true },
    );
    if (!appointment) throw new NotFoundException("Appointment not found");
    return appointment;
  }

  async deleteForMerchant(
    merchantId: Types.ObjectId,
    appointmentId: Types.ObjectId,
  ) {
    const appointment = await this.appointmentModel.findOneAndDelete({
      _id: appointmentId,
      merchant: merchantId,
    });
    if (!appointment) throw new NotFoundException("Appointment not found");
    return appointment;
  }

  async listForPatient(userId: Types.ObjectId) {
    const patient = await this.patientService.findOneByUserId(userId);

    return this.appointmentModel
      .find({ patient: patient._id })
      .populate("doctor", "name specialization");
  }

  async listForDoctor(
    userId: Types.ObjectId,
    query?: { patient?: Types.ObjectId },
  ) {
    // Support both payload styles: user id in token and legacy doctor profile id.
    const doctor: Doctor =
      await this.doctorService.findOneByUserIdWithoutPopulate(
        userId,
        "name specialization",
      );

    if (!doctor) {
      throw new NotFoundException("Doctor not found");
    }

    const data = await this.appointmentModel
      .find({
        doctor: doctor._id,
        ...(query.patient ? { patient: query.patient } : {}),
      })
      .populate("patient");

    return data;
  }

  async getById(appointmentId: Types.ObjectId) {
    const appointment = await this.appointmentModel
      .findById(appointmentId)
      .populate("doctor patient");
    if (!appointment) throw new NotFoundException("Appointment not found");
    return appointment;
  }

  async listAll() {
    return this.appointmentModel.find().populate("doctor patient");
  }

  async updatePaymentStatus(appointmentId: Types.ObjectId, status: string) {
    const validStatuses = ["PENDING", "COMPLETED", "FAILED"];
    const normalizedStatus = status.toUpperCase();

    if (!validStatuses.includes(normalizedStatus)) {
      throw new BadRequestException("Invalid payment status");
    }

    const updated = await this.appointmentModel.findByIdAndUpdate(
      appointmentId,
      { paymentStatus: normalizedStatus },
      { new: true },
    );

    if (!updated) throw new NotFoundException("Appointment not found");

    return {
      message: "Payment status updated successfully",
      appointment: updated,
    };
  }

  async retryPayment(appointmentId: Types.ObjectId) {
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) throw new NotFoundException("Appointment not found");

    if (appointment.paymentStatus === PaymentStatus.COMPLETED) {
      throw new BadRequestException("Payment already completed");
    }

    const paymentPayload = {
      appointmentId: appointment._id,
      amount: 500,
      customerName: "Retry Patient",
      customerPhone: "N/A",
      description: "Appointment repayment",
    };

    // const paymentInit = await this.paymentService.initiate(paymentPayload);
    return {
      message: "Payment re-initiated successfully",
      // payment: paymentInit,
    };
  }

  /**
   * Get available slots for a doctor on a specific date
   * Generates time slots based on doctor's schedule
   */
  async getAvailableSlots(
    doctorId: string,
    appointmentDate: string,
    slotDuration: number = 30,
  ) {
    const doctor = await this.doctorService.findOne(doctorId);
    if (!doctor) throw new NotFoundException("Doctor not found");

    const date = new Date(appointmentDate);
    const dayName = this.getDayName(date);

    // Find doctor's schedule for this day
    const daySchedule = doctor.schedules?.find((schedule) =>
      schedule.days.includes(dayName),
    );

    if (!daySchedule) {
      return {
        date: appointmentDate,
        slots: [],
        message: "Doctor is not available on this day",
      };
    }

    // Generate time slots
    const slots = this.generateTimeSlots(
      daySchedule.startTime,
      daySchedule.endTime,
      slotDuration,
      date,
      doctorId,
    );

    // Get already booked appointments for this day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await this.appointmentModel.find({
      doctor: new Types.ObjectId(doctorId),
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
    });

    const bookedSlots = new Set(
      bookedAppointments.map((apt) => apt.appointmentSlot),
    );

    // Filter out booked slots
    const availableSlots = slots.filter((slot) => !bookedSlots.has(slot));

    return {
      date: appointmentDate,
      availableSlots,
      bookedSlots: Array.from(bookedSlots),
      totalSlots: slots.length,
      availableCount: availableSlots.length,
    };
  }

  /**
   * Generate time slots between start and end times
   */
  private generateTimeSlots(
    startTime: string,
    endTime: string,
    durationMinutes: number,
    date: Date,
    doctorId: string,
  ): string[] {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMin = startMin;
    const endTotalMin = endHour * 60 + endMin;

    while (currentHour * 60 + currentMin < endTotalMin) {
      const slotStart = this.formatTime(currentHour, currentMin);
      const nextMin = currentMin + durationMinutes;
      let nextHour = currentHour;

      if (nextMin >= 60) {
        nextHour += Math.floor(nextMin / 60);
        currentMin = nextMin % 60;
      } else {
        currentMin = nextMin;
      }

      if (nextHour > endHour || (nextHour === endHour && currentMin > endMin)) {
        break;
      }

      const slotEnd = this.formatTime(nextHour, currentMin);
      slots.push(`${slotStart} - ${slotEnd}`);

      currentHour = nextHour;
    }

    return slots;
  }

  /**
   * Format time in 12-hour format with AM/PM
   */
  private formatTime(hour: number, minute: number): string {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
  }

  /**
   * Get day name from date
   */
  private getDayName(date: Date): string {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  }

  /**
   * Validate if a slot is available and not already booked
   */
  async validateSlot(
    doctorId: string,
    appointmentDate: string,
    appointmentSlot: string,
  ): Promise<boolean> {
    const date = new Date(appointmentDate);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await this.appointmentModel.findOne({
      doctor: new Types.ObjectId(doctorId),
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      appointmentSlot,
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
    });

    return !existingAppointment;
  }

  /**
   * Update appointment queue status
   */
  async updateQueueStatus(appointmentId: Types.ObjectId, queueStatus: QueueStatus) {
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) throw new NotFoundException("Appointment not found");

    appointment.queueStatus = queueStatus;
    // When completed, also set appointment status to COMPLETED
    if (queueStatus === QueueStatus.COMPLETED) {
      appointment.status = AppointmentStatus.COMPLETED;
      appointment.completedAt = new Date();
    }
    
    await appointment.save();

    // Emit event to public screens
    this.queueGateway.emitQueueUpdate(appointment.doctor.toString(), {
      appointmentId,
      queueStatus,
      serialNumber: appointment.serialNumber,
    });

    return {
      message: `Queue status updated to ${queueStatus}`,
      appointment,
    };
  }

  /**
   * Update appointment status with reason
   */
  async updateAppointmentStatus(
    appointmentId: Types.ObjectId,
    dto: UpdateAppointmentStatusDto,
    userId: Types.ObjectId,
  ) {
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) throw new NotFoundException("Appointment not found");

    // If status is being changed to CANCELLED, record cancellation details
    if (dto.status === AppointmentStatus.CANCELLED) {
      appointment.status = dto.status;
      appointment.cancellationReason = dto.reason;
      appointment.cancelledAt = new Date();
      appointment.cancelledBy = userId;
    } else if (dto.status === AppointmentStatus.COMPLETED) {
      appointment.status = dto.status;
      appointment.completedAt = new Date();
      appointment.prescriptionNotes = dto.notes;
    } else {
      appointment.status = dto.status;
      if (dto.notes) {
        appointment.note = dto.notes;
      }
    }

    const updated = await appointment.save();
    return {
      message: `Appointment status updated to ${dto.status}`,
      appointment: updated,
    };
  }

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(
    appointmentId: Types.ObjectId,
    dto: RescheduleAppointmentDto,
    userId: Types.ObjectId,
  ) {
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) throw new NotFoundException("Appointment not found");

    // Validate new slot is available
    const isSlotAvailable = await this.validateSlot(
      appointment.doctor.toString(),
      dto.newAppointmentDate,
      dto.newAppointmentSlot,
    );

    if (!isSlotAvailable) {
      throw new BadRequestException(
        "The new slot is not available. Please choose another time.",
      );
    }

    // Record reschedule history
    const rescheduleEntry = {
      previousDate: appointment.appointmentDate,
      previousSlot: appointment.appointmentSlot,
      newDate: new Date(dto.newAppointmentDate),
      newSlot: dto.newAppointmentSlot,
      reason: dto.reason,
      rescheduledAt: new Date(),
      rescheduledBy: userId,
    };

    // Update appointment
    appointment.appointmentDate = new Date(dto.newAppointmentDate);
    appointment.appointmentSlot = dto.newAppointmentSlot;
    appointment.status = AppointmentStatus.RESCHEDULED;
    appointment.rescheduleHistory = [
      ...(appointment.rescheduleHistory || []),
      rescheduleEntry,
    ];

    const updated = await appointment.save();
    return {
      message: "Appointment rescheduled successfully",
      appointment: updated,
      rescheduleHistory: rescheduleEntry,
    };
  }

  /**
   * Get appointment reports
   */
  async getAppointmentsByDateRange(
    startDate: string,
    endDate: string,
    doctorId?: string,
  ) {
    const query: any = {
      appointmentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (doctorId) {
      query.doctor = new Types.ObjectId(doctorId);
    }

    return this.appointmentModel.find(query).populate("doctor patient");
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(
    doctorId?: string,
    dateRange?: { start: string; end: string },
  ) {
    const matchStage: any = {};

    if (doctorId) {
      matchStage.doctor = new Types.ObjectId(doctorId);
    }

    if (dateRange) {
      matchStage.appointmentDate = {
        $gte: new Date(dateRange.start),
        $lte: new Date(dateRange.end),
      };
    }

    const stats = await this.appointmentModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      total: stats.reduce((sum, stat) => sum + stat.count, 0),
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id || "UNKNOWN"] = stat.count;
        return acc;
      }, {}),
    };
  }
}

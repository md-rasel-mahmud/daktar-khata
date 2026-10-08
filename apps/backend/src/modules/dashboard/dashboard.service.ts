import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import {
  AdmissionStatus,
  AppointmentStatus,
  BedStatus,
  InvoiceStatus,
  MedicationAdminStatus,
  NursingTaskStatus,
  OperationStatus,
  QueueStatus,
} from "../../constant/enums/status.enum";

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(collectionsName.patient)
    private readonly patientModel: Model<any>,
    @InjectModel(collectionsName.doctor)
    private readonly doctorModel: Model<any>,
    @InjectModel(collectionsName.staff)
    private readonly staffModel: Model<any>,
    @InjectModel(collectionsName.attendance)
    private readonly attendanceModel: Model<any>,
    @InjectModel(collectionsName.appointment)
    private readonly appointmentModel: Model<any>,
    @InjectModel(collectionsName.admission)
    private readonly admissionModel: Model<any>,
    @InjectModel(collectionsName.bed)
    private readonly bedModel: Model<any>,
    @InjectModel(collectionsName.invoice)
    private readonly invoiceModel: Model<any>,
    @InjectModel(collectionsName.income)
    private readonly incomeModel: Model<any>,
    @InjectModel(collectionsName.expense)
    private readonly expenseModel: Model<any>,
    @InjectModel(collectionsName.testOrder)
    private readonly testOrderModel: Model<any>,
    @InjectModel(collectionsName.operationCase)
    private readonly operationModel: Model<any>,
    @InjectModel(collectionsName.nursingTask)
    private readonly nursingTaskModel: Model<any>,
    @InjectModel(collectionsName.medicationAdministration)
    private readonly medicationAdminModel: Model<any>,
    @InjectModel(collectionsName.inventoryItem)
    private readonly inventoryItemModel: Model<any>,
    @InjectModel(collectionsName.commissionRecord)
    private readonly commissionRecordModel: Model<any>,
    @InjectModel(collectionsName.payroll)
    private readonly payrollModel: Model<any>,
    @InjectModel(collectionsName.subscription)
    private readonly subscriptionModel: Model<any>,
    @InjectModel(collectionsName.payment)
    private readonly paymentModel: Model<any>,
    @InjectModel(collectionsName.merchant)
    private readonly merchantModel: Model<any>,
  ) {}

  private getTodayBounds(): { startOfDay: Date; endOfDay: Date } {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    return { startOfDay, endOfDay };
  }

  async getMerchantDashboard(merchantId: Types.ObjectId) {
    const { startOfDay, endOfDay } = this.getTodayBounds();

    // 1. Patient & Clinic Volume
    const totalPatients = await this.patientModel.countDocuments({
      merchant: merchantId,
      isActive: true,
    });
    const totalDoctors = await this.doctorModel.countDocuments({
      merchant: merchantId,
      isActive: true,
    });
    const totalStaff = await this.staffModel.countDocuments({
      merchant: merchantId,
      active: true,
    });

    // 2. Today's Appointments & Queue
    const todayAppointmentsTotal = await this.appointmentModel.countDocuments({
      merchant: merchantId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      isActive: true,
    });

    const [
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      waitingQueue,
      inConsultationQueue,
    ] = await Promise.all([
      this.appointmentModel.countDocuments({
        merchant: merchantId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: AppointmentStatus.CONFIRMED,
        isActive: true,
      }),
      this.appointmentModel.countDocuments({
        merchant: merchantId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: AppointmentStatus.COMPLETED,
        isActive: true,
      }),
      this.appointmentModel.countDocuments({
        merchant: merchantId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: AppointmentStatus.CANCELLED,
        isActive: true,
      }),
      this.appointmentModel.countDocuments({
        merchant: merchantId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        queueStatus: QueueStatus.WAITING,
        isActive: true,
      }),
      this.appointmentModel.countDocuments({
        merchant: merchantId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        queueStatus: QueueStatus.IN_CONSULTATION,
        isActive: true,
      }),
    ]);

    // 3. Inpatient & Bed Occupancy
    const activeAdmissions = await this.admissionModel.countDocuments({
      merchant: merchantId,
      status: {
        $in: [AdmissionStatus.ADMITTED, AdmissionStatus.ON_TREATMENT],
      },
      isActive: true,
    });

    const totalBeds = await this.bedModel.countDocuments({
      merchant: merchantId,
      isActive: true,
    });
    const occupiedBeds = await this.bedModel.countDocuments({
      merchant: merchantId,
      status: BedStatus.OCCUPIED,
      isActive: true,
    });
    const availableBeds = await this.bedModel.countDocuments({
      merchant: merchantId,
      status: BedStatus.AVAILABLE,
      isActive: true,
    });
    const occupancyRate =
      totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // 4. Financial Calculations
    const invoicePaymentsAgg = await this.invoiceModel.aggregate([
      {
        $match: {
          merchant: merchantId,
          "paymentHistory.date": { $gte: startOfDay, $lte: endOfDay },
        },
      },
      { $unwind: "$paymentHistory" },
      {
        $match: {
          "paymentHistory.date": { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$paymentHistory.amount" },
        },
      },
    ]);
    const todayInvoiceIncome = invoicePaymentsAgg[0]?.total || 0;

    const standaloneIncomeAgg = await this.incomeModel.aggregate([
      {
        $match: {
          merchant: merchantId,
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const todayStandaloneIncome = standaloneIncomeAgg[0]?.total || 0;
    const todayTotalIncome = todayInvoiceIncome + todayStandaloneIncome;

    const expenseAgg = await this.expenseModel.aggregate([
      {
        $match: {
          merchant: merchantId,
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const todayTotalExpense = expenseAgg[0]?.total || 0;
    const netDailyRevenue = todayTotalIncome - todayTotalExpense;

    const pendingDuesAgg = await this.invoiceModel.aggregate([
      {
        $match: {
          merchant: merchantId,
          status: {
            $in: [
              InvoiceStatus.ISSUED,
              InvoiceStatus.PARTIALLY_PAID,
              InvoiceStatus.DUE,
            ],
          },
          isActive: true,
        },
      },
      { $group: { _id: null, totalDue: { $sum: "$dueAmount" } } },
    ]);
    const totalPendingDues = pendingDuesAgg[0]?.totalDue || 0;

    // 5. Operations & Low Inventory Alerts
    const upcomingOperations = await this.operationModel.countDocuments({
      merchant: merchantId,
      status: {
        $in: [
          OperationStatus.PLANNED,
          OperationStatus.SCHEDULED,
          OperationStatus.READY_FOR_OT,
        ],
      },
      isActive: true,
    });

    const lowStockAlerts = await this.inventoryItemModel.countDocuments({
      merchant: merchantId,
      isActive: true,
      $expr: { $lte: ["$currentStock", "$reorderLevel"] },
    });

    // 6. Staff Attendance Today
    const [staffPresent, staffAbsent, staffLeave] = await Promise.all([
      this.attendanceModel.countDocuments({
        merchant: merchantId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["PRESENT", "HALF_DAY"] },
      }),
      this.attendanceModel.countDocuments({
        merchant: merchantId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: "ABSENT",
      }),
      this.attendanceModel.countDocuments({
        merchant: merchantId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: "LEAVE",
      }),
    ]);

    return {
      overview: {
        totalPatients,
        totalDoctors,
        totalStaff,
      },
      appointments: {
        todayTotal: todayAppointmentsTotal,
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        queueWaiting: waitingQueue,
        queueInConsultation: inConsultationQueue,
      },
      inpatient: {
        activeAdmissions,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate,
      },
      finances: {
        todayIncome: todayTotalIncome,
        todayExpenses: todayTotalExpense,
        netRevenue: netDailyRevenue,
        pendingDues: totalPendingDues,
      },
      operations: {
        upcoming: upcomingOperations,
      },
      inventory: {
        lowStockItems: lowStockAlerts,
      },
      staffAttendance: {
        present: staffPresent,
        absent: staffAbsent,
        leave: staffLeave,
        totalStaff,
      },
    };
  }

  async getDoctorDashboard(
    merchantId: Types.ObjectId,
    doctorUserId: Types.ObjectId,
  ) {
    const { startOfDay, endOfDay } = this.getTodayBounds();

    // Resolve doctor document
    const doctor = await this.doctorModel.findOne({
      $or: [{ user: doctorUserId }, { _id: doctorUserId }],
      merchant: merchantId,
    });

    const doctorId = doctor ? doctor._id : doctorUserId;

    const [
      todayAppointments,
      waitingQueue,
      completedToday,
      activeAdmissions,
      upcomingOperations,
    ] = await Promise.all([
      this.appointmentModel.countDocuments({
        merchant: merchantId,
        doctor: doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        isActive: true,
      }),
      this.appointmentModel.countDocuments({
        merchant: merchantId,
        doctor: doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        queueStatus: QueueStatus.WAITING,
        isActive: true,
      }),
      this.appointmentModel.countDocuments({
        merchant: merchantId,
        doctor: doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: AppointmentStatus.COMPLETED,
        isActive: true,
      }),
      this.admissionModel.countDocuments({
        merchant: merchantId,
        doctor: doctorId,
        status: {
          $in: [AdmissionStatus.ADMITTED, AdmissionStatus.ON_TREATMENT],
        },
        isActive: true,
      }),
      this.operationModel.countDocuments({
        merchant: merchantId,
        $or: [{ leadSurgeon: doctorId }, { assistantSurgeons: doctorId }],
        status: {
          $in: [
            OperationStatus.PLANNED,
            OperationStatus.SCHEDULED,
            OperationStatus.READY_FOR_OT,
          ],
        },
        isActive: true,
      }),
    ]);

    // Pending lab tests for this doctor's patients
    const pendingLabOrders = await this.testOrderModel.countDocuments({
      merchant: merchantId,
      referredBy: doctorId,
      status: { $in: ["ORDERED", "SAMPLE_COLLECTED", "PROCESSING"] },
      isActive: true,
    });

    // Unsettled earned commissions
    const commissionAgg = await this.commissionRecordModel.aggregate([
      {
        $match: {
          merchant: merchantId,
          doctor: doctorId,
          status: { $in: ["EARNED", "PAYABLE", "APPROVED"] },
          isActive: true,
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const unsettledCommissions = commissionAgg[0]?.total || 0;

    return {
      todayAppointments,
      waitingQueue,
      completedToday,
      activeAdmissions,
      upcomingOperations,
      pendingLabOrders,
      unsettledCommissions,
    };
  }

  async getReceptionDashboard(merchantId: Types.ObjectId) {
    const { startOfDay, endOfDay } = this.getTodayBounds();

    const [
      todayAppointments,
      waitingQueue,
      availableBeds,
      activeAdmissions,
      dueInvoices,
      totalPatients,
    ] = await Promise.all([
      this.appointmentModel.countDocuments({
        merchant: merchantId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        isActive: true,
      }),
      this.appointmentModel.countDocuments({
        merchant: merchantId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        queueStatus: QueueStatus.WAITING,
        isActive: true,
      }),
      this.bedModel.countDocuments({
        merchant: merchantId,
        status: BedStatus.AVAILABLE,
        isActive: true,
      }),
      this.admissionModel.countDocuments({
        merchant: merchantId,
        status: {
          $in: [AdmissionStatus.ADMITTED, AdmissionStatus.ON_TREATMENT],
        },
        isActive: true,
      }),
      this.invoiceModel.countDocuments({
        merchant: merchantId,
        status: {
          $in: [
            InvoiceStatus.ISSUED,
            InvoiceStatus.PARTIALLY_PAID,
            InvoiceStatus.DUE,
          ],
        },
        isActive: true,
      }),
      this.patientModel.countDocuments({
        merchant: merchantId,
        isActive: true,
      }),
    ]);

    return {
      todayAppointments,
      waitingQueue,
      availableBeds,
      activeAdmissions,
      dueInvoices,
      totalPatients,
    };
  }

  async getNurseDashboard(merchantId: Types.ObjectId) {
    const { startOfDay, endOfDay } = this.getTodayBounds();
    const now = new Date();

    const [
      occupiedBeds,
      activeAdmissions,
      pendingTasks,
      overdueTasks,
      todayMedicationsTotal,
      givenMedications,
    ] = await Promise.all([
      this.bedModel.countDocuments({
        merchant: merchantId,
        status: BedStatus.OCCUPIED,
        isActive: true,
      }),
      this.admissionModel.countDocuments({
        merchant: merchantId,
        status: {
          $in: [AdmissionStatus.ADMITTED, AdmissionStatus.ON_TREATMENT],
        },
        isActive: true,
      }),
      this.nursingTaskModel.countDocuments({
        merchant: merchantId,
        scheduledTime: { $gte: startOfDay, $lte: endOfDay },
        status: NursingTaskStatus.PENDING,
        isActive: true,
      }),
      this.nursingTaskModel.countDocuments({
        merchant: merchantId,
        scheduledTime: { $lt: now },
        status: NursingTaskStatus.PENDING,
        isActive: true,
      }),
      this.medicationAdminModel.countDocuments({
        merchant: merchantId,
        scheduledTime: { $gte: startOfDay, $lte: endOfDay },
        isActive: true,
      }),
      this.medicationAdminModel.countDocuments({
        merchant: merchantId,
        scheduledTime: { $gte: startOfDay, $lte: endOfDay },
        status: MedicationAdminStatus.GIVEN,
        isActive: true,
      }),
    ]);

    return {
      occupiedBeds,
      activeAdmissions,
      pendingTasks,
      overdueTasks,
      medicationsScheduledToday: todayMedicationsTotal,
      medicationsGivenToday: givenMedications,
    };
  }

  async getAccountantDashboard(merchantId: Types.ObjectId) {
    const { startOfDay, endOfDay } = this.getTodayBounds();

    const invoicePaymentsAgg = await this.invoiceModel.aggregate([
      {
        $match: {
          merchant: merchantId,
          "paymentHistory.date": { $gte: startOfDay, $lte: endOfDay },
        },
      },
      { $unwind: "$paymentHistory" },
      {
        $match: {
          "paymentHistory.date": { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$paymentHistory.amount" },
        },
      },
    ]);
    const todayCollections = invoicePaymentsAgg[0]?.total || 0;

    const dueInvoicesAgg = await this.invoiceModel.aggregate([
      {
        $match: {
          merchant: merchantId,
          status: {
            $in: [
              InvoiceStatus.ISSUED,
              InvoiceStatus.PARTIALLY_PAID,
              InvoiceStatus.DUE,
            ],
          },
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalDue: { $sum: "$dueAmount" },
        },
      },
    ]);
    const dueCount = dueInvoicesAgg[0]?.count || 0;
    const dueTotal = dueInvoicesAgg[0]?.totalDue || 0;

    const expenseAgg = await this.expenseModel.aggregate([
      {
        $match: {
          merchant: merchantId,
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const todayExpenses = expenseAgg[0]?.total || 0;

    // Doctor Commissions
    const commissionsEarnedAgg = await this.commissionRecordModel.aggregate([
      {
        $match: {
          merchant: merchantId,
          status: { $in: ["EARNED", "PAYABLE"] },
          isActive: true,
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const commissionsPayable = commissionsEarnedAgg[0]?.total || 0;

    // Latest Payroll Cycle stats
    const currentMonth = `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1,
    ).padStart(2, "0")}`;
    const payrollAgg = await this.payrollModel.aggregate([
      {
        $match: {
          merchant: merchantId,
          billingCycle: currentMonth,
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalNet: { $sum: "$netPayable" },
        },
      },
    ]);

    return {
      todayCollections,
      dueInvoices: {
        count: dueCount,
        totalDue: dueTotal,
      },
      todayExpenses,
      commissionsPayable,
      currentMonthPayroll: {
        cycle: currentMonth,
        breakdown: payrollAgg,
      },
    };
  }

  async superAdminStats() {
    const [
      totalMerchants,
      totalDoctors,
      totalPatients,
      totalStaff,
      activeSubscriptions,
      revenueAgg,
    ] = await Promise.all([
      this.merchantModel.countDocuments(),
      this.doctorModel.countDocuments(),
      this.patientModel.countDocuments(),
      this.staffModel.countDocuments(),
      this.subscriptionModel.countDocuments({
        status: "ACTIVE",
        isDeleted: { $ne: true },
      }),
      this.paymentModel.aggregate([
        { $match: { status: "COMPLETED" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    return {
      totalMerchants,
      totalDoctors,
      totalPatients,
      totalStaff,
      activeSubscriptions,
      revenue: revenueAgg[0]?.total || 0,
    };
  }
}

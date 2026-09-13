import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { PayrollDocument } from "./schema/payroll.schema";
import { CreatePayrollDto } from "./dto/create-payroll.dto";
import { GenerateCyclePayrollDto } from "./dto/generate-cycle-payroll.dto";
import { UpdatePayrollDto } from "./dto/update-payroll.dto";
import { PayPayrollDto } from "./dto/pay-payroll.dto";
import {
  PayrollStatus,
  SalaryType,
} from "../../constant/enums/status.enum";
import { StaffDocument } from "../staff/schema/staff.schema";
import { AttendanceDocument } from "../staff/schema/attendance.schema";
import { CommissionRecordDocument } from "../commission-record/schema/commission-record.schema";

@Injectable()
export class PayrollService {
  constructor(
    @InjectModel(collectionsName.payroll)
    private readonly payrollModel: Model<PayrollDocument>,
    @InjectModel(collectionsName.staff)
    private readonly staffModel: Model<StaffDocument>,
    @InjectModel(collectionsName.attendance)
    private readonly attendanceModel: Model<AttendanceDocument>,
    @InjectModel(collectionsName.commissionRecord)
    private readonly commissionRecordModel: Model<CommissionRecordDocument>,
  ) {}

  async create(dto: CreatePayrollDto, merchantId: Types.ObjectId) {
    if (dto.staff) {
      const existing = await this.payrollModel.findOne({
        merchant: merchantId,
        staff: new Types.ObjectId(dto.staff),
        billingCycle: dto.billingCycle,
        isActive: true,
      });
      if (existing) {
        throw new BadRequestException(
          `A payroll record already exists for this staff member in cycle ${dto.billingCycle}`,
        );
      }
    }

    const baseSalary = dto.baseSalary || 0;
    const attendanceAdjustment = dto.attendanceAdjustment || 0;
    const overtime = dto.overtime || 0;
    const commission = dto.commission || 0;
    const bonus = dto.bonus || 0;
    const deduction = dto.deduction || 0;
    const advance = dto.advance || 0;

    const netPayable = Math.max(
      0,
      baseSalary +
        attendanceAdjustment +
        overtime +
        commission +
        bonus -
        deduction -
        advance,
    );

    return this.payrollModel.create({
      ...dto,
      merchant: merchantId,
      staff: dto.staff ? new Types.ObjectId(dto.staff) : null,
      doctor: dto.doctor ? new Types.ObjectId(dto.doctor) : null,
      salaryType: dto.salaryType || SalaryType.MONTHLY,
      baseSalary,
      attendanceDays: dto.attendanceDays || 0,
      attendanceAdjustment,
      overtime,
      commission,
      bonus,
      deduction,
      advance,
      netPayable,
      status: dto.status || PayrollStatus.DRAFT,
      isLocked: dto.status === PayrollStatus.PAID,
      isActive: true,
    });
  }

  async generateCycle(
    dto: GenerateCyclePayrollDto,
    merchantId: Types.ObjectId,
  ) {
    const [yearStr, monthStr] = dto.billingCycle.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const staffList = await this.staffModel.find({
      merchant: merchantId,
      active: true,
    });

    let createdCount = 0;
    let skippedCount = 0;
    const createdPayrolls: any[] = [];

    for (const staff of staffList) {
      // Idempotency check: don't create duplicate payroll for same staff in same cycle
      const existing = await this.payrollModel.findOne({
        merchant: merchantId,
        staff: staff._id,
        billingCycle: dto.billingCycle,
        isActive: true,
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      let baseSalary = staff.salary || 0;
      let attendanceDays = 0;
      let attendanceAdjustment = 0;

      // Calculate attendance for DAILY salary workers
      if (staff.salaryType === SalaryType.DAILY) {
        const attendanceCount = await this.attendanceModel.countDocuments({
          staff: staff._id,
          merchant: merchantId,
          date: { $gte: startDate, $lte: endDate },
          status: { $in: ["PRESENT", "HALF_DAY"] },
        });
        attendanceDays = attendanceCount;
        baseSalary = attendanceCount * (staff.salary || 0);
      }

      const netPayable = Math.max(0, baseSalary);

      const payroll = await this.payrollModel.create({
        merchant: merchantId,
        staff: staff._id,
        recipientName: staff.name,
        recipientRole: staff.staffRole,
        billingCycle: dto.billingCycle,
        salaryType: staff.salaryType || SalaryType.MONTHLY,
        baseSalary,
        attendanceDays,
        attendanceAdjustment,
        overtime: 0,
        commission: 0,
        bonus: 0,
        deduction: 0,
        advance: 0,
        netPayable,
        status: PayrollStatus.DRAFT,
        isLocked: false,
        isActive: true,
      });

      createdPayrolls.push(payroll);
      createdCount++;
    }

    return {
      message: `Payroll cycle ${dto.billingCycle} generated successfully`,
      billingCycle: dto.billingCycle,
      createdCount,
      skippedCount,
      payrolls: createdPayrolls,
    };
  }

  async update(id: string, dto: UpdatePayrollDto) {
    const payroll = await this.payrollModel.findById(new Types.ObjectId(id));
    if (!payroll || !payroll.isActive) {
      throw new NotFoundException("Payroll record not found");
    }

    if (payroll.isLocked || payroll.status === PayrollStatus.PAID) {
      throw new BadRequestException(
        "Paid payroll records are locked from modification",
      );
    }

    if (dto.baseSalary !== undefined) payroll.baseSalary = dto.baseSalary;
    if (dto.attendanceDays !== undefined) {
      payroll.attendanceDays = dto.attendanceDays;
    }
    if (dto.attendanceAdjustment !== undefined) {
      payroll.attendanceAdjustment = dto.attendanceAdjustment;
    }
    if (dto.overtime !== undefined) payroll.overtime = dto.overtime;
    if (dto.commission !== undefined) payroll.commission = dto.commission;
    if (dto.bonus !== undefined) payroll.bonus = dto.bonus;
    if (dto.deduction !== undefined) payroll.deduction = dto.deduction;
    if (dto.advance !== undefined) payroll.advance = dto.advance;
    if (dto.notes !== undefined) payroll.notes = dto.notes;

    payroll.netPayable = Math.max(
      0,
      payroll.baseSalary +
        payroll.attendanceAdjustment +
        payroll.overtime +
        payroll.commission +
        payroll.bonus -
        payroll.deduction -
        payroll.advance,
    );

    return payroll.save();
  }

  async approve(id: string, approvedById?: Types.ObjectId) {
    const payroll = await this.payrollModel.findById(new Types.ObjectId(id));
    if (!payroll || !payroll.isActive) {
      throw new NotFoundException("Payroll record not found");
    }

    if (payroll.isLocked || payroll.status === PayrollStatus.PAID) {
      throw new BadRequestException(
        "Paid payroll records cannot have status modified",
      );
    }

    payroll.status = PayrollStatus.APPROVED;
    payroll.approvedAt = new Date();
    if (approvedById) payroll.approvedBy = approvedById;

    return payroll.save();
  }

  async pay(id: string, dto: PayPayrollDto) {
    const payroll = await this.payrollModel.findById(new Types.ObjectId(id));
    if (!payroll || !payroll.isActive) {
      throw new NotFoundException("Payroll record not found");
    }

    if (payroll.isLocked || payroll.status === PayrollStatus.PAID) {
      throw new BadRequestException("Payroll record is already marked as paid");
    }

    payroll.status = PayrollStatus.PAID;
    payroll.paidAt = new Date();
    payroll.paymentMethod = dto.paymentMethod || "CASH";
    if (dto.transactionReference) {
      payroll.transactionReference = dto.transactionReference;
    }
    if (dto.notes) payroll.notes = dto.notes;
    payroll.isLocked = true; // Lock record from further silent edits

    return payroll.save();
  }

  async findAll(
    merchantId?: string,
    billingCycle?: string,
    status?: PayrollStatus,
    staffId?: string,
    doctorId?: string,
  ) {
    const filter: any = { isActive: true };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    if (billingCycle) filter.billingCycle = billingCycle;
    if (status) filter.status = status;
    if (staffId) filter.staff = new Types.ObjectId(staffId);
    if (doctorId) filter.doctor = new Types.ObjectId(doctorId);

    return this.payrollModel
      .find(filter)
      .populate("staff", "name phone staffRole salaryType")
      .populate("doctor", "name phone specialization")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });
  }

  async findByStaff(staffId: string, merchantId?: string) {
    const filter: any = {
      staff: new Types.ObjectId(staffId),
      isActive: true,
    };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);

    return this.payrollModel.find(filter).sort({ billingCycle: -1 });
  }

  async findOne(id: string) {
    const payroll = await this.payrollModel
      .findById(new Types.ObjectId(id))
      .populate("staff", "name phone staffRole salaryType bankDetails")
      .populate("doctor", "name phone specialization")
      .populate("approvedBy", "name email");

    if (!payroll) throw new NotFoundException("Payroll record not found");
    return payroll;
  }
}

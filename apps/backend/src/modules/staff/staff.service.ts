import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UserService } from "src/modules/user/user.service";
import { CreateStaffDto } from "./dto/create-staff.dto";
import { Model, Types } from "mongoose";
import { RolesEnum, collectionsName } from "../../constant";
import { StaffDocument } from "./schema/staff.schema";
import { UpdateStaffDto } from "./dto/update-staff.dto";
import { RecordAttendanceDto } from "./dto/record-attendance.dto";
import { AttendanceDocument } from "./schema/attendance.schema";
import { CreateLeaveRequestDto } from "./dto/create-leave-request.dto";
import { UpdateLeaveStatusDto } from "./dto/update-leave-status.dto";
import {
  AttendanceStatusEnum,
  LeaveStatusEnum,
  PayrollStatusEnum,
  StaffRoleEnum,
} from "src/constant/enums/staff-role.enum";
import { CreatePayrollDto } from "./dto/create-payroll.dto";

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(collectionsName.staff)
    private readonly staffModel: Model<StaffDocument>,
    @InjectModel(collectionsName.attendance)
    private readonly attendanceModel: Model<AttendanceDocument>,
    private readonly userService: UserService,
  ) {}

  private getStartOfDay(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private getEndOfDay(date: Date) {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  private calculateDays(fromDate: Date, toDate: Date) {
    const diffTime =
      this.getEndOfDay(toDate).getTime() -
      this.getStartOfDay(fromDate).getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  private async findStaffForMerchant(
    merchantId: Types.ObjectId,
    staffId: Types.ObjectId,
  ) {
    const staff = await this.staffModel.findOne({
      _id: staffId,
      merchant: merchantId,
    });

    if (!staff) throw new NotFoundException("Staff not found");

    return staff;
  }

  async createForMerchant(merchantId: Types.ObjectId, dto: CreateStaffDto) {
    const createUserDto = {
      phone: dto.phone,
      email: dto.email,
      role: RolesEnum.STAFF,
      password: dto.password,
    };

    const user = await this.userService.createUser(createUserDto);

    const createdStaff = await this.staffModel.create({
      user: user._id,
      merchant: merchantId,
      clinic: dto.clinicId ? new Types.ObjectId(dto.clinicId) : undefined,
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      staffRole: dto.staffRole || StaffRoleEnum.RECEPTIONIST,
      customRoleName: dto.customRoleName,
      permissions: dto.permissions || [],
      designation: dto.designation,
      salary: dto.salary || 0,
      leaveBalance: dto.leaveBalance ?? 12,
      notes: dto.notes,
      active: true,
    });

    return createdStaff;
  }

  async findByUserId(userId: Types.ObjectId) {
    return this.staffModel.findOne({ user: userId, active: true }).lean();
  }

  async listForMerchant(merchantId: Types.ObjectId) {
    return this.staffModel
      .find({ merchant: merchantId })
      .populate("user", "phone email role")
      .populate("clinic", "name");
  }

  async listAll() {
    return this.staffModel
      .find({})
      .populate("user", "phone email role")
      .populate("merchant", "name clinicName")
      .populate("clinic", "name");
  }

  async getByIdForMerchant(
    merchantId: Types.ObjectId,
    staffId: Types.ObjectId,
  ) {
    const staff = await this.staffModel
      .findOne({ _id: staffId, merchant: merchantId })
      .populate("user", "phone email role")
      .populate("clinic", "name");

    if (!staff) throw new NotFoundException("Staff not found");

    return staff;
  }

  async updateForMerchant(
    merchantId: Types.ObjectId,
    staffId: Types.ObjectId,
    dto: UpdateStaffDto,
  ) {
    const updatePayload: any = {
      ...dto,
      clinic: dto.clinicId ? new Types.ObjectId(dto.clinicId) : undefined,
    };

    delete updatePayload.clinicId;

    const updated = await this.staffModel.findOneAndUpdate(
      { _id: staffId, merchant: merchantId },
      updatePayload,
      { new: true },
    );

    if (!updated) throw new NotFoundException("Staff not found");

    return updated;
  }

  async deactivateForMerchant(
    merchantId: Types.ObjectId,
    staffId: Types.ObjectId,
  ) {
    const updated = await this.staffModel.findOneAndUpdate(
      { _id: staffId, merchant: merchantId },
      { active: false },
      { new: true },
    );

    if (!updated) throw new NotFoundException("Staff not found");

    return updated;
  }

  async recordAttendanceForMerchant(
    merchantId: Types.ObjectId,
    staffId: Types.ObjectId,
    dto: RecordAttendanceDto,
  ) {
    await this.findStaffForMerchant(merchantId, staffId);

    const sourceDate = dto.date ? new Date(dto.date) : new Date();
    const dayStart = this.getStartOfDay(sourceDate);
    const dayEnd = this.getEndOfDay(sourceDate);

    const existing = await this.attendanceModel.findOne({
      merchant: merchantId,
      staff: staffId,
      date: { $gte: dayStart, $lte: dayEnd },
    });

    if (existing) {
      if (dto.checkIn) existing.checkIn = new Date(dto.checkIn);
      if (dto.checkOut) existing.checkOut = new Date(dto.checkOut);
      if (dto.status) existing.status = dto.status;
      if (dto.note !== undefined) existing.note = dto.note;

      return existing.save();
    }

    return this.attendanceModel.create({
      merchant: merchantId,
      staff: staffId,
      date: dayStart,
      checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
      checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
      status: dto.status || AttendanceStatusEnum.PRESENT,
      note: dto.note,
    });
  }

  async listAttendanceForStaff(
    merchantId: Types.ObjectId,
    staffId: Types.ObjectId,
    query?: { fromDate?: string; toDate?: string },
  ) {
    await this.findStaffForMerchant(merchantId, staffId);

    const filter: any = {
      merchant: merchantId,
      staff: staffId,
    };

    if (query?.fromDate || query?.toDate) {
      filter.date = {};

      if (query.fromDate) {
        filter.date.$gte = this.getStartOfDay(new Date(query.fromDate));
      }

      if (query.toDate) {
        filter.date.$lte = this.getEndOfDay(new Date(query.toDate));
      }
    }

    return this.attendanceModel.find(filter).sort({ date: -1 });
  }

  async createLeaveRequestForStaff(
    merchantId: Types.ObjectId,
    staffId: Types.ObjectId,
    dto: CreateLeaveRequestDto,
  ) {
    const staff = await this.findStaffForMerchant(merchantId, staffId);

    const fromDate = new Date(dto.fromDate);
    const toDate = new Date(dto.toDate);

    if (fromDate > toDate) {
      throw new BadRequestException("fromDate cannot be after toDate");
    }

    staff.leaveRequests.push({
      fromDate,
      toDate,
      reason: dto.reason,
      status: LeaveStatusEnum.PENDING,
    } as any);

    await staff.save();

    return staff.leaveRequests[staff.leaveRequests.length - 1];
  }

  async listLeaveRequestsForStaff(
    merchantId: Types.ObjectId,
    staffId: Types.ObjectId,
    status?: LeaveStatusEnum,
  ) {
    const staff = await this.findStaffForMerchant(merchantId, staffId);
    const leaves = status
      ? staff.leaveRequests.filter((leave) => leave.status === status)
      : staff.leaveRequests;

    return leaves.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }

  async updateLeaveStatusForStaff(
    merchantId: Types.ObjectId,
    staffId: Types.ObjectId,
    leaveId: string,
    dto: UpdateLeaveStatusDto,
    approvedBy: Types.ObjectId,
  ) {
    const staff = await this.findStaffForMerchant(merchantId, staffId);

    const leaveRequest = (staff.leaveRequests as any).id(leaveId);
    if (!leaveRequest) throw new NotFoundException("Leave request not found");

    leaveRequest.status = dto.status;
    leaveRequest.remarks = dto.remarks;
    leaveRequest.approvedBy = approvedBy;
    leaveRequest.approvedAt = new Date();

    if (dto.status === LeaveStatusEnum.APPROVED) {
      const leaveDays = this.calculateDays(
        new Date(leaveRequest.fromDate),
        new Date(leaveRequest.toDate),
      );
      staff.leaveBalance = Math.max(0, (staff.leaveBalance || 0) - leaveDays);
    }

    await staff.save();

    return leaveRequest;
  }

  async createPayrollForStaff(
    merchantId: Types.ObjectId,
    staffId: Types.ObjectId,
    dto: CreatePayrollDto,
  ) {
    const staff = await this.findStaffForMerchant(merchantId, staffId);

    const bonus = dto.bonus || 0;
    const deduction = dto.deduction || 0;
    const netPay = Math.max(0, dto.basicSalary + bonus - deduction);

    staff.payrolls.push({
      month: dto.month,
      year: dto.year,
      basicSalary: dto.basicSalary,
      bonus,
      deduction,
      netPay,
      status: dto.status || PayrollStatusEnum.PENDING,
      paidAt:
        (dto.status || PayrollStatusEnum.PENDING) === PayrollStatusEnum.PAID
          ? new Date()
          : undefined,
      note: dto.note,
    } as any);

    await staff.save();

    return staff.payrolls[staff.payrolls.length - 1];
  }

  async listPayrollForStaff(
    merchantId: Types.ObjectId,
    staffId: Types.ObjectId,
  ) {
    const staff = await this.findStaffForMerchant(merchantId, staffId);

    return [...staff.payrolls].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });
  }
}

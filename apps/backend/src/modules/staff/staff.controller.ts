import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { StaffService } from "./staff.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateStaffDto } from "./dto/create-staff.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser } from "../../common";
import { UpdateStaffDto } from "./dto/update-staff.dto";
import { RecordAttendanceDto } from "./dto/record-attendance.dto";
import { CreateLeaveRequestDto } from "./dto/create-leave-request.dto";
import { UpdateLeaveStatusDto } from "./dto/update-leave-status.dto";
import { CreatePayrollDto } from "./dto/create-payroll.dto";
import { LeaveStatusEnum } from "../../constant/enums/staff-role.enum";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PermissionKeyEnum } from "../../constant";

@Controller("staff")
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  private resolveMerchantId(user: IAuthUser) {
    return new Types.ObjectId(user.merchant || user._id);
  }

  @Post()
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.STAFF_CREATE)
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateStaffDto) {
    return this.staffService.createForMerchant(
      this.resolveMerchantId(user),
      dto,
    );
  }

  @Get()
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.STAFF_READ)
  async listMy(@AuthUser() user: IAuthUser) {
    return this.staffService.listForMerchant(this.resolveMerchantId(user));
  }

  @Get("all")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async listAll() {
    return this.staffService.listAll();
  }

  @Get(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.STAFF_READ)
  async getById(@AuthUser() user: IAuthUser, @Param("id") id: string) {
    return this.staffService.getByIdForMerchant(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
    );
  }

  @Patch(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.STAFF_UPDATE)
  async update(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.staffService.updateForMerchant(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
      dto,
    );
  }

  @Delete(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.STAFF_DELETE)
  async remove(@AuthUser() user: IAuthUser, @Param("id") id: string) {
    return this.staffService.deactivateForMerchant(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
    );
  }

  @Post(":id/attendance")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.STAFF_ATTENDANCE)
  async recordAttendance(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: RecordAttendanceDto,
  ) {
    return this.staffService.recordAttendanceForMerchant(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
      dto,
    );
  }

  @Get(":id/attendance")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.STAFF_ATTENDANCE)
  async listAttendance(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string,
  ) {
    return this.staffService.listAttendanceForStaff(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
      { fromDate, toDate },
    );
  }

  @Post(":id/leave")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.STAFF_LEAVE)
  async createLeaveRequest(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    return this.staffService.createLeaveRequestForStaff(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
      dto,
    );
  }

  @Get(":id/leave")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.STAFF_LEAVE)
  async listLeaveRequests(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Query("status") status?: LeaveStatusEnum,
  ) {
    return this.staffService.listLeaveRequestsForStaff(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
      status,
    );
  }

  @Patch(":id/leave/:leaveId")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.STAFF_LEAVE)
  async updateLeaveStatus(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Param("leaveId") leaveId: string,
    @Body() dto: UpdateLeaveStatusDto,
  ) {
    return this.staffService.updateLeaveStatusForStaff(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
      leaveId,
      dto,
      new Types.ObjectId(user._id),
    );
  }

  @Post(":id/payroll")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.STAFF_PAYROLL)
  async createPayroll(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: CreatePayrollDto,
  ) {
    return this.staffService.createPayrollForStaff(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
      dto,
    );
  }

  @Get(":id/payroll")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.STAFF_PAYROLL)
  async listPayroll(@AuthUser() user: IAuthUser, @Param("id") id: string) {
    return this.staffService.listPayrollForStaff(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
    );
  }
}

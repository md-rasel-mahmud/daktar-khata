import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { NursingTaskService } from "./nursing-task.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateNursingTaskDto } from "./dto/create-nursing-task.dto";
import { UpdateNursingTaskStatusDto } from "./dto/update-nursing-task-status.dto";
import { LogVitalsDto } from "./dto/log-vitals.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser } from "../../common";
import {
  NursingTaskStatus,
  NursingTaskType,
} from "../../constant/enums/status.enum";

@Controller("nursing-task")
export class NursingTaskController {
  constructor(private readonly nursingTaskService: NursingTaskService) {}

  @Post()
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateNursingTaskDto) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    return this.nursingTaskService.create(dto, merchantId);
  }

  @Get()
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findAll(
    @AuthUser() user: IAuthUser,
    @Query("merchant") merchantId?: string,
    @Query("admission") admissionId?: string,
    @Query("patient") patientId?: string,
    @Query("assignedTo") assignedToId?: string,
    @Query("status") status?: NursingTaskStatus,
    @Query("taskType") taskType?: NursingTaskType,
  ) {
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : merchantId;
    return this.nursingTaskService.findAll(
      targetMerchant,
      admissionId,
      patientId,
      assignedToId,
      status,
      taskType,
    );
  }

  @Get("admission/:admissionId")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findByAdmission(
    @AuthUser() user: IAuthUser,
    @Param("admissionId") admissionId: string,
  ) {
    if (!Types.ObjectId.isValid(admissionId)) {
      throw new BadRequestException("Invalid admission ID");
    }
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : undefined;
    return this.nursingTaskService.findByAdmission(
      admissionId,
      targetMerchant,
    );
  }

  @Get(":id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findOne(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid nursing task ID");
    }
    return this.nursingTaskService.findOne(id);
  }

  @Patch(":id/status")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async updateStatus(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateNursingTaskStatusDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid nursing task ID");
    }
    const performedById = user._id ? new Types.ObjectId(user._id) : undefined;
    return this.nursingTaskService.updateStatus(id, dto, performedById);
  }

  @Patch(":id/vitals")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async logVitals(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: LogVitalsDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid nursing task ID");
    }
    const performedById = user._id ? new Types.ObjectId(user._id) : undefined;
    return this.nursingTaskService.logVitals(id, dto, performedById);
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { UpdateAppointmentStatusDto } from "./dto/update-appointment-status.dto";
import { RescheduleAppointmentDto } from "./dto/reschedule-appointment.dto";
import { GetAvailableSlotsDto } from "./dto/get-available-slots.dto";
import { Types } from "mongoose";
import { Roles } from "src/common/decorators/roles.decorator";
import { IAuthUser } from "src/common";

@Controller("appointment")
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles(RolesEnum.PATIENT, RolesEnum.MERCHANT)
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateAppointmentDto) {
    return this.appointmentService.createAppointment(
      new Types.ObjectId(user._id),
      dto,
    );
  }

  @Get()
  @Roles(
    RolesEnum.PATIENT,
    RolesEnum.DOCTOR,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
    RolesEnum.MERCHANT,
  )
  async listAppointments(
    @AuthUser() user: IAuthUser,
    @Query("patient") patientId: string,
  ) {
    if (user.role === RolesEnum.DOCTOR) {
      if (patientId && !Types.ObjectId.isValid(patientId)) {
        throw new BadRequestException("Invalid patientId");
      }

      return this.appointmentService.listForDoctor(
        new Types.ObjectId(user._id),
        {
          patient: patientId ? new Types.ObjectId(patientId) : undefined,
        },
      );
    }

    if (user.role === RolesEnum.PATIENT) {
      if (patientId && !Types.ObjectId.isValid(patientId)) {
        throw new BadRequestException("Invalid patientId");
      }

      return this.appointmentService.listForPatient(user._id);
    }

    return this.appointmentService.listAll();
  }

  @Get("all")
  @Roles(RolesEnum.MERCHANT, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  async listAll() {
    return this.appointmentService.listAll();
  }

  @Get("slots/available")
  @Roles(RolesEnum.PATIENT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async getAvailableSlots(
    @Query("doctorId") doctorId: string,
    @Query("appointmentDate") appointmentDate: string,
    @Query("slotDuration") slotDuration?: string,
  ) {
    if (!doctorId || !Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException("Invalid or missing doctorId");
    }

    if (!appointmentDate) {
      throw new BadRequestException("appointmentDate is required");
    }

    return this.appointmentService.getAvailableSlots(
      doctorId,
      appointmentDate,
      slotDuration ? parseInt(slotDuration) : 30,
    );
  }

  @Get("stats")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async getStats(
    @AuthUser() user: IAuthUser,
    @Query("doctorId") doctorId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.appointmentService.getAppointmentStats(
      doctorId,
      startDate && endDate ? { start: startDate, end: endDate } : undefined,
    );
  }

  @Get(":id")
  @Roles(
    RolesEnum.PATIENT,
    RolesEnum.DOCTOR,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async getById(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid appointment ID");
    }
    return this.appointmentService.getById(new Types.ObjectId(id));
  }

  @Put(":id")
  @Roles(RolesEnum.PATIENT, RolesEnum.DOCTOR)
  async update(
    @AuthUser() user: any,
    @Param("id") id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.updateForMerchant(
      new Types.ObjectId(user._id),
      new Types.ObjectId(id),
      dto,
    );
  }

  @Put(":id/status")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async updateStatus(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid appointment ID");
    }
    return this.appointmentService.updateAppointmentStatus(
      new Types.ObjectId(id),
      dto,
      new Types.ObjectId(user._id),
    );
  }

  @Post(":id/reschedule")
  @Roles(RolesEnum.PATIENT, RolesEnum.DOCTOR)
  async reschedule(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid appointment ID");
    }
    return this.appointmentService.rescheduleAppointment(
      new Types.ObjectId(id),
      dto,
      new Types.ObjectId(user._id),
    );
  }

  @Delete(":id")
  @Roles(RolesEnum.PATIENT)
  async remove(@AuthUser() user: any, @Param("id") id: string) {
    return this.appointmentService.deleteForMerchant(
      new Types.ObjectId(user._id),
      new Types.ObjectId(id),
    );
  }
}

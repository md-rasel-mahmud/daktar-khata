import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { AppointmentQueueService } from "./appointment-queue.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common";
import { IAuthUser } from "../../common";
import { QueueStatus } from "../../constant/enums/status.enum";

@Controller("appointment/queue")
export class AppointmentQueueController {
  constructor(private readonly queueService: AppointmentQueueService) {}

  /**
   * Public snapshot for the waiting room TV outside a doctor's chamber.
   * Completely open, sanitized (no patient PII).
   */
  @Public()
  @Get("public/:doctorId")
  async getPublicSnapshot(@Param("doctorId") doctorId: string) {
    if (!doctorId) {
      throw new BadRequestException("doctorId is required");
    }
    return this.queueService.getPublicSnapshot(doctorId);
  }

  /**
   * Public multi-doctor overview for central waiting hall TV board.
   */
  @Public()
  @Get("multi-summary")
  async getMultiSummary(@Query("merchant") merchantId?: string) {
    return this.queueService.getMultiSummary(merchantId);
  }

  /**
   * Full authenticated queue for Doctor / Receptionist.
   */
  @Get("today")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async getTodayQueue(
    @AuthUser() user: IAuthUser,
    @Query("doctorId") doctorId?: string,
  ) {
    return this.queueService.getTodayQueue(user, doctorId);
  }

  /**
   * Doctor / Staff calls the next patient in line.
   */
  @Post("call-next")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async callNext(
    @AuthUser() user: IAuthUser,
    @Body("doctorId") doctorId?: string,
  ) {
    return this.queueService.callNext(user, doctorId);
  }

  /**
   * Update queue status (CALLED, IN_CONSULTATION, COMPLETED, SKIPPED, CANCELLED).
   */
  @Patch(":id/status")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async updateQueueStatus(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body("queueStatus") queueStatus: QueueStatus,
  ) {
    return this.queueService.updateQueueStatus(user, id, queueStatus);
  }

  /**
   * Toggle emergency triage flag.
   */
  @Patch(":id/emergency")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async setEmergency(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body("isEmergency") isEmergency: boolean,
  ) {
    return this.queueService.setEmergency(user, id, isEmergency);
  }

  /**
   * Patient arrival check-in at reception desk.
   */
  @Post(":id/check-in")
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async checkIn(@AuthUser() user: IAuthUser, @Param("id") id: string) {
    return this.queueService.checkIn(user, id);
  }
}

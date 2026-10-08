import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { AuditLogService } from "./audit-log.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateAuditLogDto } from "./dto/create-audit-log.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser } from "../../common";
import { AuditEvent } from "../../constant/enums/status.enum";
import { Request } from "express";

@Controller("audit-log")
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: CreateAuditLogDto,
    @Req() req: Request,
  ) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }

    const actorId = new Types.ObjectId(user._id);
    const actorName = user.email || "Staff User";
    const role = user.role || "STAFF";
    const ipAddress = req.ip || req.socket.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";

    return this.auditLogService.log(
      dto,
      merchantId,
      actorId,
      actorName,
      role,
      ipAddress,
      userAgent,
    );
  }

  @Get("entity/:entityType/:entityId")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async findByEntity(
    @AuthUser() user: IAuthUser,
    @Param("entityType") entityType: string,
    @Param("entityId") entityId: string,
  ) {
    if (!Types.ObjectId.isValid(entityId)) {
      throw new BadRequestException("Invalid entity ID");
    }
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : undefined;
    return this.auditLogService.findByEntity(
      entityType,
      entityId,
      targetMerchant,
    );
  }

  @Get()
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async findAll(
    @AuthUser() user: IAuthUser,
    @Query("merchant") merchantId?: string,
    @Query("entityType") entityType?: string,
    @Query("entityId") entityId?: string,
    @Query("action") action?: AuditEvent,
    @Query("actor") actorId?: string,
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string,
  ) {
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : merchantId;
    return this.auditLogService.findAll(
      targetMerchant,
      entityType,
      entityId,
      action,
      actorId,
      fromDate,
      toDate,
    );
  }

  @Get(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async findOne(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid audit log ID");
    }
    return this.auditLogService.findOne(id);
  }
}

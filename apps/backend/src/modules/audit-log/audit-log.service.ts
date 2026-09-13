import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { AuditLogDocument } from "./schema/audit-log.schema";
import { CreateAuditLogDto } from "./dto/create-audit-log.dto";
import { AuditEvent } from "../../constant/enums/status.enum";

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(collectionsName.auditLog)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(
    dto: CreateAuditLogDto,
    merchantId: Types.ObjectId,
    actorId: Types.ObjectId,
    actorName: string,
    role: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.auditLogModel.create({
      actor: actorId,
      actorName: actorName || "System",
      role: role || "UNKNOWN",
      merchant: merchantId,
      clinic: dto.clinic ? new Types.ObjectId(dto.clinic) : null,
      action: dto.action,
      entityType: dto.entityType,
      entityId: new Types.ObjectId(dto.entityId),
      previousValue: dto.previousValue || null,
      newValue: dto.newValue || null,
      ipAddress: ipAddress || "",
      userAgent: userAgent || "",
      timestamp: new Date(),
    });
  }

  async findAll(
    merchantId?: string,
    entityType?: string,
    entityId?: string,
    action?: AuditEvent,
    actorId?: string,
    fromDate?: string,
    toDate?: string,
  ) {
    const filter: any = {};
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = new Types.ObjectId(entityId);
    if (action) filter.action = action;
    if (actorId) filter.actor = new Types.ObjectId(actorId);

    if (fromDate || toDate) {
      filter.timestamp = {};
      if (fromDate) filter.timestamp.$gte = new Date(fromDate);
      if (toDate) filter.timestamp.$lte = new Date(toDate);
    }

    return this.auditLogModel
      .find(filter)
      .populate("actor", "name email phone role")
      .sort({ timestamp: -1 })
      .limit(100);
  }

  async findByEntity(
    entityType: string,
    entityId: string,
    merchantId?: string,
  ) {
    const filter: any = {
      entityType,
      entityId: new Types.ObjectId(entityId),
    };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);

    return this.auditLogModel
      .find(filter)
      .populate("actor", "name email role")
      .sort({ timestamp: -1 });
  }

  async findOne(id: string) {
    const log = await this.auditLogModel
      .findById(new Types.ObjectId(id))
      .populate("actor", "name email phone role");
    if (!log) throw new NotFoundException("Audit log entry not found");
    return log;
  }
}

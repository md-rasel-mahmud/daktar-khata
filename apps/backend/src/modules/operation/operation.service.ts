import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { OperationCaseDocument } from "./schema/operation.schema";
import { CreateOperationDto } from "./dto/create-operation.dto";
import { UpdateOperationDto } from "./dto/update-operation.dto";
import { UpdatePreOpDto } from "./dto/update-pre-op.dto";
import { UpdateOperationNotesDto } from "./dto/update-operation-notes.dto";
import { UpdateOperationStatusDto } from "./dto/update-operation-status.dto";
import { OperationStatus } from "../../constant/enums/status.enum";

@Injectable()
export class OperationService {
  constructor(
    @InjectModel(collectionsName.operationCase)
    private readonly operationModel: Model<OperationCaseDocument>,
  ) {}

  private generateCaseNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `OT-${timestamp}-${random}`;
  }

  async create(dto: CreateOperationDto, merchantId: Types.ObjectId) {
    const caseNumber = this.generateCaseNumber();
    const assistantSurgeons = (dto.assistantSurgeons || []).map(
      (id) => new Types.ObjectId(id),
    );

    return this.operationModel.create({
      ...dto,
      caseNumber,
      patient: new Types.ObjectId(dto.patient),
      admission: dto.admission ? new Types.ObjectId(dto.admission) : null,
      leadSurgeon: new Types.ObjectId(dto.leadSurgeon),
      assistantSurgeons,
      scheduledStartTime: dto.scheduledStartTime
        ? new Date(dto.scheduledStartTime)
        : null,
      scheduledEndTime: dto.scheduledEndTime
        ? new Date(dto.scheduledEndTime)
        : null,
      status: dto.status || OperationStatus.PLANNED,
      charges: dto.charges || 0,
      merchant: merchantId,
      isActive: true,
    });
  }

  async update(id: string, dto: UpdateOperationDto) {
    const updatePayload: any = { ...dto };
    if (dto.patient) updatePayload.patient = new Types.ObjectId(dto.patient);
    if (dto.admission) updatePayload.admission = new Types.ObjectId(dto.admission);
    if (dto.leadSurgeon) updatePayload.leadSurgeon = new Types.ObjectId(dto.leadSurgeon);
    if (dto.assistantSurgeons) {
      updatePayload.assistantSurgeons = dto.assistantSurgeons.map(
        (docId) => new Types.ObjectId(docId),
      );
    }
    if (dto.scheduledStartTime) {
      updatePayload.scheduledStartTime = new Date(dto.scheduledStartTime);
    }
    if (dto.scheduledEndTime) {
      updatePayload.scheduledEndTime = new Date(dto.scheduledEndTime);
    }

    const op = await this.operationModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      updatePayload,
      { new: true },
    );
    if (!op) throw new NotFoundException("Operation case not found");
    return op;
  }

  async updatePreOp(id: string, dto: UpdatePreOpDto) {
    const op = await this.operationModel.findById(new Types.ObjectId(id));
    if (!op) throw new NotFoundException("Operation case not found");

    op.preOpChecklist = {
      ...op.preOpChecklist,
      ...dto,
    };

    return op.save();
  }

  async updateNotes(id: string, dto: UpdateOperationNotesDto) {
    const op = await this.operationModel.findById(new Types.ObjectId(id));
    if (!op) throw new NotFoundException("Operation case not found");

    if (dto.actualStartTime) op.actualStartTime = new Date(dto.actualStartTime);
    if (dto.actualEndTime) op.actualEndTime = new Date(dto.actualEndTime);

    op.operationNotes = {
      findings: dto.findings ?? op.operationNotes?.findings ?? "",
      procedureDetails:
        dto.procedureDetails ?? op.operationNotes?.procedureDetails ?? "",
      complications:
        dto.complications ?? op.operationNotes?.complications ?? "",
      postOpInstructions:
        dto.postOpInstructions ?? op.operationNotes?.postOpInstructions ?? "",
      followUpPlan:
        dto.followUpPlan ?? op.operationNotes?.followUpPlan ?? "",
    };

    return op.save();
  }

  async updateStatus(id: string, dto: UpdateOperationStatusDto) {
    const updatePayload: any = { status: dto.status };
    if (dto.status === OperationStatus.IN_PROGRESS) {
      updatePayload.actualStartTime = new Date();
    } else if (dto.status === OperationStatus.COMPLETED) {
      updatePayload.actualEndTime = new Date();
    }

    const op = await this.operationModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      updatePayload,
      { new: true },
    );
    if (!op) throw new NotFoundException("Operation case not found");
    return op;
  }

  async findAll(
    merchantId?: string,
    surgeonId?: string,
    patientId?: string,
    status?: OperationStatus,
  ) {
    const filter: any = { isActive: true };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    if (surgeonId) filter.leadSurgeon = new Types.ObjectId(surgeonId);
    if (patientId) filter.patient = new Types.ObjectId(patientId);
    if (status) filter.status = status;

    return this.operationModel
      .find(filter)
      .populate("patient", "name phone email gender bloodGroup")
      .populate("leadSurgeon", "name phone specialization")
      .populate("assistantSurgeons", "name specialization")
      .populate("admission", "admissionNumber room bed status")
      .sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const op = await this.operationModel
      .findById(new Types.ObjectId(id))
      .populate("patient", "name phone email gender bloodGroup age")
      .populate("leadSurgeon", "name phone specialization department")
      .populate("assistantSurgeons", "name specialization department")
      .populate({
        path: "admission",
        populate: [
          { path: "room", select: "roomNumber roomType" },
          { path: "bed", select: "bedNumber" },
        ],
      });

    if (!op) throw new NotFoundException("Operation case not found");
    return op;
  }

  async findByPatient(patientId: string, merchantId?: string) {
    const filter: any = {
      patient: new Types.ObjectId(patientId),
      isActive: true,
    };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);

    return this.operationModel
      .find(filter)
      .populate("leadSurgeon", "name specialization")
      .sort({ createdAt: -1 });
  }

  async findByAdmission(admissionId: string, merchantId?: string) {
    const filter: any = {
      admission: new Types.ObjectId(admissionId),
      isActive: true,
    };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);

    return this.operationModel
      .find(filter)
      .populate("leadSurgeon", "name specialization")
      .sort({ createdAt: -1 });
  }
}

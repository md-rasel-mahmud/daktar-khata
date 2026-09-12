import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { NursingTaskDocument } from "./schema/nursing-task.schema";
import { CreateNursingTaskDto } from "./dto/create-nursing-task.dto";
import { UpdateNursingTaskStatusDto } from "./dto/update-nursing-task-status.dto";
import { LogVitalsDto } from "./dto/log-vitals.dto";
import {
  NursingTaskStatus,
  NursingTaskType,
} from "../../constant/enums/status.enum";

@Injectable()
export class NursingTaskService {
  constructor(
    @InjectModel(collectionsName.nursingTask)
    private readonly nursingTaskModel: Model<NursingTaskDocument>,
  ) {}

  async create(dto: CreateNursingTaskDto, merchantId: Types.ObjectId) {
    return this.nursingTaskModel.create({
      ...dto,
      patient: new Types.ObjectId(dto.patient),
      admission: new Types.ObjectId(dto.admission),
      bed: dto.bed ? new Types.ObjectId(dto.bed) : null,
      assignedTo: dto.assignedTo ? new Types.ObjectId(dto.assignedTo) : null,
      scheduledTime: dto.scheduledTime
        ? new Date(dto.scheduledTime)
        : new Date(),
      status: NursingTaskStatus.PENDING,
      merchant: merchantId,
      isActive: true,
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateNursingTaskStatusDto,
    performedById?: Types.ObjectId,
  ) {
    const task = await this.nursingTaskModel.findById(new Types.ObjectId(id));
    if (!task || !task.isActive) {
      throw new NotFoundException("Nursing task not found");
    }

    if (dto.status === NursingTaskStatus.SKIPPED && !dto.skippedReason) {
      throw new BadRequestException(
        "A reason is required when marking a task as skipped",
      );
    }

    task.status = dto.status;
    if (dto.skippedReason) task.skippedReason = dto.skippedReason;
    if (dto.notes) task.notes = dto.notes;

    if (dto.status === NursingTaskStatus.COMPLETED) {
      task.completedTime = new Date();
    }
    if (performedById) {
      task.performedBy = performedById;
    }

    return task.save();
  }

  async logVitals(
    id: string,
    dto: LogVitalsDto,
    performedById?: Types.ObjectId,
  ) {
    const task = await this.nursingTaskModel.findById(new Types.ObjectId(id));
    if (!task || !task.isActive) {
      throw new NotFoundException("Nursing task not found");
    }

    task.vitals = {
      bloodPressure: dto.bloodPressure || "",
      pulse: dto.pulse ?? undefined,
      temperature: dto.temperature ?? undefined,
      spO2: dto.spO2 ?? undefined,
      respiratoryRate: dto.respiratoryRate ?? undefined,
    };

    if (dto.notes) task.notes = dto.notes;
    task.status = NursingTaskStatus.COMPLETED;
    task.completedTime = new Date();
    if (performedById) {
      task.performedBy = performedById;
    }

    return task.save();
  }

  async findAll(
    merchantId?: string,
    admissionId?: string,
    patientId?: string,
    assignedToId?: string,
    status?: NursingTaskStatus,
    taskType?: NursingTaskType,
  ) {
    const filter: any = { isActive: true };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    if (admissionId) filter.admission = new Types.ObjectId(admissionId);
    if (patientId) filter.patient = new Types.ObjectId(patientId);
    if (assignedToId) filter.assignedTo = new Types.ObjectId(assignedToId);
    if (status) filter.status = status;
    if (taskType) filter.taskType = taskType;

    return this.nursingTaskModel
      .find(filter)
      .populate("patient", "name phone gender age bloodGroup")
      .populate("admission", "admissionNumber room bed")
      .populate("assignedTo", "name role")
      .populate("performedBy", "name role")
      .sort({ scheduledTime: 1 });
  }

  async findOne(id: string) {
    const task = await this.nursingTaskModel
      .findById(new Types.ObjectId(id))
      .populate("patient", "name phone gender age bloodGroup")
      .populate("admission", "admissionNumber room bed")
      .populate("bed", "bedNumber")
      .populate("assignedTo", "name role")
      .populate("performedBy", "name role");

    if (!task) throw new NotFoundException("Nursing task not found");
    return task;
  }

  async findByAdmission(admissionId: string, merchantId?: string) {
    const filter: any = {
      admission: new Types.ObjectId(admissionId),
      isActive: true,
    };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);

    return this.nursingTaskModel
      .find(filter)
      .populate("assignedTo", "name")
      .populate("performedBy", "name")
      .sort({ scheduledTime: -1 });
  }
}

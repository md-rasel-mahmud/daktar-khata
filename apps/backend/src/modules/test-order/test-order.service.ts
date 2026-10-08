import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { TestOrderDocument } from "./schema/test-order.schema";
import { CreateTestOrderDto } from "./dto/create-test-order.dto";
import { TestOrderStatus } from "../../constant/enums/status.enum";
import { DoctorService } from "../doctor/doctor.service";

@Injectable()
export class TestOrderService {
  constructor(
    @InjectModel(collectionsName.testOrder)
    private readonly testOrderModel: Model<TestOrderDocument>,
    private readonly doctorService: DoctorService,
  ) {}

  async create(dto: CreateTestOrderDto) {
    const doctor = await this.doctorService.findOne(dto.doctor);
    return this.testOrderModel.create({
      ...dto,
      merchant: doctor.merchant,
      patient: new Types.ObjectId(dto.patient),
      doctor: doctor._id,
      ...(dto.encounter && { encounter: new Types.ObjectId(dto.encounter) }),
      items: dto.items.map((item) => ({
        ...item,
        test: new Types.ObjectId(item.test),
      })),
    });
  }

  async getByEncounter(encounterId: string) {
    return this.testOrderModel
      .findOne({ encounter: new Types.ObjectId(encounterId) })
      .populate("patient doctor");
  }

  async getByPatient(patientId: string) {
    return this.testOrderModel
      .find({ patient: new Types.ObjectId(patientId) })
      .sort({ createdAt: -1 })
      .populate("doctor", "name specialization");
  }

  async updateItemStatus(
    orderId: string,
    itemIndex: number,
    status: TestOrderStatus,
  ) {
    const order = await this.testOrderModel.findById(new Types.ObjectId(orderId));
    if (!order) throw new NotFoundException("Test order not found");
    if (itemIndex < 0 || itemIndex >= order.items.length) {
      throw new BadRequestException("Invalid item index");
    }

    order.items[itemIndex].status = status;

    // Derive top-level status from items
    const allStatuses = order.items.map((i) => i.status);
    if (allStatuses.every((s) => s === TestOrderStatus.APPROVED)) {
      order.status = TestOrderStatus.APPROVED;
    } else if (allStatuses.every((s) => s === TestOrderStatus.CANCELLED)) {
      order.status = TestOrderStatus.CANCELLED;
    } else if (allStatuses.some((s) => s === TestOrderStatus.REPORT_READY || s === TestOrderStatus.APPROVED)) {
      order.status = TestOrderStatus.REPORT_READY;
    } else if (allStatuses.some((s) => s === TestOrderStatus.PROCESSING)) {
      order.status = TestOrderStatus.PROCESSING;
    } else if (allStatuses.some((s) => s === TestOrderStatus.SAMPLE_COLLECTED)) {
      order.status = TestOrderStatus.SAMPLE_COLLECTED;
    }

    await order.save();
    return order;
  }
}

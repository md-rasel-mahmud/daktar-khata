import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { TestOrderDocument } from "./schema/test-order.schema";
import { CreateTestOrderDto } from "./dto/create-test-order.dto";
import { TestOrderStatus } from "../../constant/enums/status.enum";
import { DoctorService } from "../doctor/doctor.service";
import { QueueGateway } from "../queue/queue.gateway";

import { Patient } from "../patient/schema/patient.schema";

@Injectable()
export class TestOrderService {
  constructor(
    @InjectModel(collectionsName.testOrder)
    private readonly testOrderModel: Model<TestOrderDocument>,
    @InjectModel(collectionsName.patient)
    private readonly patientModel: Model<Patient>,
    private readonly doctorService: DoctorService,
    private readonly queueGateway: QueueGateway,
  ) {}

  private todayRange(date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  private generateOrderNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TO-${dateStr}-${random}`;
  }

  async create(dto: CreateTestOrderDto, authUserMerchantId?: Types.ObjectId) {
    let merchantId = authUserMerchantId;
    let doctorDoc: any = null;

    if (dto.doctor && Types.ObjectId.isValid(dto.doctor)) {
      doctorDoc = await this.doctorService.findOne(dto.doctor);
      if (doctorDoc?.merchant) {
        merchantId = doctorDoc.merchant;
      }
    } else if (dto.merchant && Types.ObjectId.isValid(dto.merchant)) {
      merchantId = new Types.ObjectId(dto.merchant);
    }

    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required to create a test order");
    }

    const { start, end } = this.todayRange();
    const todayCount = await this.testOrderModel.countDocuments({
      merchant: merchantId,
      createdAt: { $gte: start, $lte: end },
    });

    const tokenNumber = todayCount + 1;
    const orderNumber = this.generateOrderNumber();

    const subtotal = dto.items.reduce((s, itm) => s + (itm.price || 0), 0);
    let discountAmount = 0;
    if (dto.discount && dto.discount > 0) {
      if (dto.discountType === "PERCENTAGE") {
        discountAmount =
          Math.round(((subtotal * dto.discount) / 100) * 100) / 100;
      } else {
        discountAmount = dto.discount;
      }
    }
    discountAmount = Math.min(discountAmount, subtotal);
    const totalAmount = Math.max(0, subtotal - discountAmount);
    const paidAmount =
      typeof dto.paidAmount === "number" ? dto.paidAmount : totalAmount;
    const dueAmount = Math.max(0, totalAmount - paidAmount);
    const paymentStatus =
      dueAmount === 0 ? "PAID" : paidAmount > 0 ? "PARTIALLY_PAID" : "DUE";

    const order = await this.testOrderModel.create({
      ...dto,
      orderNumber,
      tokenNumber,
      isWalkIn: !dto.doctor,
      merchant: merchantId,
      patient: new Types.ObjectId(dto.patient),
      doctor: doctorDoc ? doctorDoc._id : null,
      referringDoctorName: dto.referringDoctorName || "",
      discount: discountAmount,
      discountType: dto.discountType || "FIXED",
      totalAmount,
      paidAmount,
      dueAmount,
      paymentStatus,
      ...(dto.encounter && { encounter: new Types.ObjectId(dto.encounter) }),
      items: dto.items.map((item) => ({
        ...item,
        test: new Types.ObjectId(item.test),
        status: TestOrderStatus.ORDERED,
      })),
      status: TestOrderStatus.ORDERED,
    });

    // Broadcast update to station
    const stations = dto.items.map((i) => i.testName);
    for (const st of stations) {
      this.broadcastStationQueue(st, merchantId.toString());
    }

    return order;
  }

  async findAll(options?: {
    merchantId?: string;
    status?: string;
    patientId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { merchantId, status, patientId, search, page, limit } = options || {};
    const filter: any = {};
    if (merchantId && Types.ObjectId.isValid(merchantId)) {
      filter.merchant = new Types.ObjectId(merchantId);
    }
    if (status) {
      filter.status = status;
    }
    if (patientId && Types.ObjectId.isValid(patientId)) {
      filter.patient = new Types.ObjectId(patientId);
    }

    if (search && search.trim()) {
      const q = search.trim();
      const searchOr: any[] = [];

      searchOr.push({ orderNumber: { $regex: q, $options: "i" } });
      searchOr.push({ tokenNumber: { $regex: q, $options: "i" } });
      searchOr.push({ referringDoctorName: { $regex: q, $options: "i" } });

      const matchingPatients = await this.patientModel
        .find({
          $or: [
            { name: { $regex: q, $options: "i" } },
            { mobile: { $regex: q, $options: "i" } },
          ],
        })
        .select("_id")
        .limit(50);

      const patientIds = matchingPatients.map((p) => p._id);
      if (patientIds.length > 0) {
        searchOr.push({ patient: { $in: patientIds } });
      }

      if (Types.ObjectId.isValid(q)) {
        searchOr.push({ _id: new Types.ObjectId(q) });
      }

      filter.$or = searchOr;
    }

    const pageNum = page && page > 0 ? page : 1;
    const limitNum = limit && limit > 0 ? Math.min(100, limit) : 10;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.testOrderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("patient", "name mobile gender bloodGroup")
        .populate("doctor", "name specialization"),
      this.testOrderModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
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

    if (order.items[itemIndex]?.testName) {
      this.broadcastStationQueue(order.items[itemIndex].testName, order.merchant.toString());
    }

    return order;
  }

  /**
   * Diagnostic station snapshot for TV waiting room screen.
   */
  async getPublicStationSnapshot(stationName: string, merchantId?: string) {
    const { start, end } = this.todayRange();
    const filter: any = {
      createdAt: { $gte: start, $lte: end },
      status: { $nin: [TestOrderStatus.CANCELLED] },
    };
    if (merchantId && Types.ObjectId.isValid(merchantId)) {
      filter.merchant = new Types.ObjectId(merchantId);
    }

    const orders = await this.testOrderModel
      .find(filter)
      .sort({ tokenNumber: 1 })
      .populate("patient", "name gender")
      .lean();

    // Filter orders that contain a test matching stationName (or all if not specified)
    const matchingOrders = stationName
      ? orders.filter((o) =>
          o.items.some((i) => i.testName.toLowerCase().includes(stationName.toLowerCase())),
        )
      : orders;

    const current = matchingOrders.find((o) => o.status === TestOrderStatus.PROCESSING) || null;
    const waiting = matchingOrders.filter(
      (o) => o.status === TestOrderStatus.ORDERED || o.status === TestOrderStatus.SAMPLE_COLLECTED,
    );
    const completed = matchingOrders.filter(
      (o) => o.status === TestOrderStatus.REPORT_READY || o.status === TestOrderStatus.APPROVED,
    );

    return {
      stationName,
      date: start.toISOString(),
      current: current
        ? {
            orderNumber: current.orderNumber,
            tokenNumber: current.tokenNumber,
            status: current.status,
          }
        : null,
      next: waiting[0]
        ? { orderNumber: waiting[0].orderNumber, tokenNumber: waiting[0].tokenNumber }
        : null,
      nextSecond: waiting[1]
        ? { orderNumber: waiting[1].orderNumber, tokenNumber: waiting[1].tokenNumber }
        : null,
      waitingTokens: waiting.map((w) => ({
        tokenNumber: w.tokenNumber,
        orderNumber: w.orderNumber,
      })),
      waitingCount: waiting.length,
      completedCount: completed.length,
      updatedAt: new Date().toISOString(),
    };
  }

  async callNextStationToken(stationName: string, merchantId?: string) {
    const { start, end } = this.todayRange();
    const filter: any = {
      createdAt: { $gte: start, $lte: end },
      status: { $in: [TestOrderStatus.ORDERED, TestOrderStatus.SAMPLE_COLLECTED] },
    };
    if (merchantId && Types.ObjectId.isValid(merchantId)) {
      filter.merchant = new Types.ObjectId(merchantId);
    }

    const nextOrder = await this.testOrderModel.findOne(filter).sort({ tokenNumber: 1 });
    if (!nextOrder) {
      throw new NotFoundException(`No pending test orders for ${stationName}`);
    }

    nextOrder.status = TestOrderStatus.PROCESSING;
    if (stationName) {
      const itm = nextOrder.items.find((i) =>
        i.testName.toLowerCase().includes(stationName.toLowerCase()),
      );
      if (itm) itm.status = TestOrderStatus.PROCESSING;
    }
    await nextOrder.save();

    this.broadcastStationQueue(stationName, nextOrder.merchant.toString());
    return nextOrder;
  }

  async broadcastStationQueue(stationName: string, merchantId: string) {
    try {
      const snapshot = await this.getPublicStationSnapshot(stationName, merchantId);
      this.queueGateway.emitTestQueueUpdate(stationName, snapshot);
    } catch {
      // Best-effort
    }
  }
}

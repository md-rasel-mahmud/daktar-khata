import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { LabReportDocument } from "./schema/lab-report.schema";
import { CreateLabReportDto } from "./dto/create-lab-report.dto";
import { TestOrderService } from "../test-order/test-order.service";
import { TestOrderStatus } from "../../constant/enums/status.enum";

@Injectable()
export class LabReportService {
  constructor(
    @InjectModel(collectionsName.labReport)
    private readonly labReportModel: Model<LabReportDocument>,
    private readonly testOrderService: TestOrderService,
  ) {}

  async create(dto: CreateLabReportDto, userId: Types.ObjectId, merchantId: Types.ObjectId) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    const reportNumber = `REP-${dateStr}-${random}`;
    const downloadToken = Math.random().toString(36).substring(2, 10).toUpperCase();

    const report = await this.labReportModel.create({
      ...dto,
      reportNumber,
      downloadToken,
      testOrder: new Types.ObjectId(dto.testOrder),
      patient: new Types.ObjectId(dto.patient),
      merchant: merchantId,
      reportedBy: userId,
    });

    // Update the test order item status to REPORT_READY
    await this.testOrderService.updateItemStatus(
      dto.testOrder,
      dto.testOrderItemIndex,
      TestOrderStatus.REPORT_READY,
    );

    return report;
  }

  async findAll(merchantId?: string) {
    const filter: any = {};
    if (merchantId && Types.ObjectId.isValid(merchantId)) {
      filter.merchant = new Types.ObjectId(merchantId);
    }
    return this.labReportModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate("patient", "name mobile gender bloodGroup")
      .populate("testOrder reportedBy approvedBy");
  }

  async getByPatient(patientId: string) {
    return this.labReportModel
      .find({ patient: new Types.ObjectId(patientId) })
      .sort({ createdAt: -1 })
      .populate("testOrder reportedBy approvedBy");
  }

  async publicSearch(phone: string, tokenOrNumber: string) {
    const cleanPhone = phone?.trim();
    const cleanToken = tokenOrNumber?.trim();

    if (!cleanPhone || !cleanToken) {
      throw new NotFoundException("Phone number and Report Token / Number are required");
    }

    const reports = await this.labReportModel
      .find({
        $or: [
          { reportNumber: cleanToken },
          { downloadToken: cleanToken.toUpperCase() },
        ],
      })
      .populate("patient", "name mobile gender")
      .populate("testOrder reportedBy approvedBy");

    // Match patient phone
    const matched = reports.find((r: any) => {
      const patientMobile = r.patient?.mobile || "";
      return patientMobile.endsWith(cleanPhone) || cleanPhone.endsWith(patientMobile);
    });

    if (!matched) {
      throw new NotFoundException("No lab report found matching the provided details");
    }

    return matched;
  }

  async approve(id: string, userId: Types.ObjectId) {
    const report = await this.labReportModel.findById(new Types.ObjectId(id));
    if (!report) throw new NotFoundException("Lab report not found");

    report.isApproved = true;
    report.approvedBy = userId;
    report.approvedAt = new Date();
    await report.save();

    // Update the test order item status to APPROVED
    await this.testOrderService.updateItemStatus(
      report.testOrder.toString(),
      report.testOrderItemIndex,
      TestOrderStatus.APPROVED,
    );

    return report;
  }
}

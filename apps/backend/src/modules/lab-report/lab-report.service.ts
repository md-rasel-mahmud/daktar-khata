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
    const report = await this.labReportModel.create({
      ...dto,
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

  async getByPatient(patientId: string) {
    return this.labReportModel
      .find({ patient: new Types.ObjectId(patientId) })
      .sort({ createdAt: -1 })
      .populate("testOrder reportedBy approvedBy");
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

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Types, Connection } from "mongoose";
import { collectionsName } from "../../constant";
import { AdmissionDocument } from "./schema/admission.schema";
import { CreateAdmissionDto } from "./dto/create-admission.dto";
import { DischargeDto } from "./dto/discharge.dto";
import { AdmissionStatus, BedStatus } from "../../constant/enums/status.enum";
import { DoctorService } from "../doctor/doctor.service";
import { BedDocument } from "../bed/schema/bed.schema";
import { BedAllocationDocument } from "../bed-allocation/schema/bed-allocation.schema";
import { InvoiceDocument } from "../invoice/schema/invoice.schema";
import { Patient } from "../patient/schema/patient.schema";
import { InvoiceStatus } from "../../constant/enums/status.enum";

@Injectable()
export class AdmissionService {
  constructor(
    @InjectModel(collectionsName.admission)
    private readonly admissionModel: Model<AdmissionDocument>,
    @InjectModel(collectionsName.bed)
    private readonly bedModel: Model<BedDocument>,
    @InjectModel(collectionsName.bedAllocation)
    private readonly allocationModel: Model<BedAllocationDocument>,
    @InjectModel(collectionsName.invoice)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(collectionsName.patient)
    private readonly patientModel: Model<Patient>,
    @InjectConnection() private readonly connection: Connection,
    private readonly doctorService: DoctorService,
  ) {}

  async create(dto: CreateAdmissionDto, userId: Types.ObjectId, merchantId?: Types.ObjectId) {
    let targetMerchant = merchantId;
    let doctorDoc: any = null;

    if (dto.doctor && Types.ObjectId.isValid(dto.doctor)) {
      doctorDoc = await this.doctorService.findOne(dto.doctor);
      if (doctorDoc?.merchant) targetMerchant = doctorDoc.merchant;
    }

    if (!targetMerchant) {
      throw new BadRequestException("Merchant ID is required for admission");
    }

    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const admissionData: any = {
        ...dto,
        merchant: targetMerchant,
        patient: new Types.ObjectId(dto.patient),
        doctor: doctorDoc ? doctorDoc._id : null,
        status: AdmissionStatus.ADMITTED,
      };

      // Convert ObjectId fields
      if (dto.clinic) admissionData.clinic = new Types.ObjectId(dto.clinic);
      if (dto.ward) admissionData.ward = new Types.ObjectId(dto.ward);
      if (dto.room) admissionData.room = new Types.ObjectId(dto.room);
      if (dto.bed) admissionData.bed = new Types.ObjectId(dto.bed);
      if (dto.responsibleStaff) admissionData.responsibleStaff = new Types.ObjectId(dto.responsibleStaff);

      const [admission] = await this.admissionModel.create([admissionData], { session });

      // Auto-allocate bed if provided
      if (dto.bed) {
        const bed = await this.bedModel.findById(new Types.ObjectId(dto.bed)).session(session);
        if (!bed) throw new NotFoundException("Bed not found");
        if (bed.status !== BedStatus.AVAILABLE) {
          throw new BadRequestException(
            `Bed is currently ${bed.status}. Only AVAILABLE beds can be allocated.`,
          );
        }

        bed.status = BedStatus.OCCUPIED;
        await bed.save({ session });

        await this.allocationModel.create(
          [
            {
              bed: bed._id,
              patient: new Types.ObjectId(dto.patient),
              admission: admission._id,
              merchant: targetMerchant,
              allocatedBy: userId,
            },
          ],
          { session },
        );
      }

      await session.commitTransaction();
      return admission;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findAll(options?: {
    status?: string;
    doctorId?: string;
    merchantId?: string;
    patientId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, doctorId, merchantId, patientId, search, page, limit } = options || {};
    const filter: any = {};
    if (status) filter.status = status;
    if (doctorId && Types.ObjectId.isValid(doctorId)) filter.doctor = new Types.ObjectId(doctorId);
    if (merchantId && Types.ObjectId.isValid(merchantId)) filter.merchant = new Types.ObjectId(merchantId);
    if (patientId && Types.ObjectId.isValid(patientId)) filter.patient = new Types.ObjectId(patientId);

    if (search && search.trim()) {
      const q = search.trim();
      const searchOr: any[] = [];

      // 1. Search patient by name or phone
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

      // 2. Search invoice by invoiceNumber linked to admission
      const matchingInvoices = await this.invoiceModel
        .find({
          invoiceNumber: { $regex: q, $options: "i" },
          admission: { $exists: true, $ne: null },
        })
        .select("admission")
        .limit(50);

      const admissionIdsFromInvoice = matchingInvoices
        .map((inv: any) => inv.admission)
        .filter(Boolean);
      if (admissionIdsFromInvoice.length > 0) {
        searchOr.push({ _id: { $in: admissionIdsFromInvoice } });
      }

      // 3. Match admission ID directly if valid ObjectId
      if (Types.ObjectId.isValid(q)) {
        searchOr.push({ _id: new Types.ObjectId(q) });
      }

      if (searchOr.length > 0) {
        filter.$or = searchOr;
      } else {
        return {
          data: [],
          total: 0,
          page: page || 1,
          limit: limit || 10,
          totalPages: 0,
        };
      }
    }

    const pageNum = page && page > 0 ? page : 1;
    const limitNum = limit && limit > 0 ? Math.min(100, limit) : 10;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.admissionModel
        .find(filter)
        .sort({ admissionDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("patient", "name mobile phone gender bloodGroup")
        .populate("doctor", "name specialization")
        .populate("ward", "name")
        .populate("room", "name")
        .populate("bed", "bedNumber"),
      this.admissionModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  async findOne(id: string) {
    const admission = await this.admissionModel
      .findById(new Types.ObjectId(id))
      .populate("patient doctor ward room bed responsibleStaff");
    if (!admission) throw new NotFoundException("Admission not found");
    return admission;
  }

  async getByPatient(patientId: string) {
    return this.admissionModel
      .find({ patient: new Types.ObjectId(patientId) })
      .sort({ admissionDate: -1 })
      .populate("doctor", "name specialization")
      .populate("ward", "name")
      .populate("bed", "bedNumber");
  }

  async updateStatus(id: string, status: AdmissionStatus) {
    const admission = await this.admissionModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { status },
      { new: true },
    );
    if (!admission) throw new NotFoundException("Admission not found");
    return admission;
  }

  async discharge(id: string, dto: DischargeDto, userId: Types.ObjectId) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const admission = await this.admissionModel.findById(new Types.ObjectId(id)).session(session);
      if (!admission) throw new NotFoundException("Admission not found");
      if (admission.status === AdmissionStatus.DISCHARGED) {
        throw new BadRequestException("Patient is already discharged");
      }

      admission.status = AdmissionStatus.DISCHARGED;
      admission.actualDischargeDate = new Date();
      if (dto.dischargeNotes) admission.dischargeNotes = dto.dischargeNotes;
      await admission.save({ session });

      // Release bed allocation
      if (admission.bed) {
        const activeAllocation = await this.allocationModel.findOne({
          admission: admission._id,
          isActive: true,
        }).session(session);

        if (activeAllocation) {
          activeAllocation.isActive = false;
          activeAllocation.releasedAt = new Date();
          activeAllocation.releasedBy = userId;
          await activeAllocation.save({ session });

          await this.bedModel.findByIdAndUpdate(
            activeAllocation.bed,
            { status: BedStatus.AVAILABLE },
            { session },
          );
        }
      }

      await session.commitTransaction();
      return { message: "Patient discharged successfully", admission };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async addDailyCharge(
    admissionId: string,
    dto: {
      serviceName: string;
      category?: string;
      quantity?: number;
      unitPrice: number;
      notes?: string;
    },
    userId: Types.ObjectId,
  ) {
    const admission = await this.admissionModel.findById(new Types.ObjectId(admissionId));
    if (!admission) throw new NotFoundException("Admission not found");
    if (admission.status === AdmissionStatus.DISCHARGED) {
      throw new BadRequestException("Cannot add charges to discharged admission");
    }

    const qty = dto.quantity || 1;
    const price = dto.unitPrice || 0;
    const lineItemTotal = qty * price;

    let invoice = await this.invoiceModel.findOne({
      admission: admission._id,
      status: { $ne: InvoiceStatus.CANCELLED },
    });

    if (!invoice) {
      const invoiceNumber = `INV-ADM-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      invoice = new this.invoiceModel({
        invoiceNumber,
        patient: admission.patient,
        doctor: admission.doctor || null,
        admission: admission._id,
        merchant: admission.merchant,
        status: InvoiceStatus.ISSUED,
        issuedDate: new Date(),
        lineItems: [],
        subtotal: 0,
        totalDiscount: 0,
        totalTax: 0,
        grandTotal: 0,
        paidAmount: 0,
        dueAmount: 0,
      });
    }

    invoice.lineItems.push({
      serviceName: dto.serviceName,
      category: (dto.category as any) || "NURSING",
      quantity: qty,
      unitPrice: price,
      discount: 0,
      tax: 0,
      total: lineItemTotal,
    });

    invoice.subtotal = invoice.lineItems.reduce((s, itm) => s + itm.total, 0);
    invoice.grandTotal = invoice.subtotal;
    invoice.dueAmount = Math.max(0, invoice.grandTotal - (invoice.paidAmount || 0));
    await invoice.save();

    return {
      message: "Daily charge added to admission invoice",
      invoice,
    };
  }

  async getAdmissionInvoice(admissionId: string) {
    return this.invoiceModel.findOne({
      admission: new Types.ObjectId(admissionId),
      status: { $ne: InvoiceStatus.CANCELLED },
    });
  }
}

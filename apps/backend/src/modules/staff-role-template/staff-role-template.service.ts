import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { PermissionKeyEnum, collectionsName } from "../../constant";
import { StaffRoleEnum } from "../../constant/enums/staff-role.enum";
import { CreateStaffRoleTemplateDto } from "./dto/create-staff-role-template.dto";
import { UpdateStaffRoleTemplateDto } from "./dto/update-staff-role-template.dto";
import { StaffRoleTemplateDocument } from "./schema/staff-role-template.schema";

@Injectable()
export class StaffRoleTemplateService {
  constructor(
    @InjectModel(collectionsName.staffRoleTemplate)
    private readonly templateModel: Model<StaffRoleTemplateDocument>,
  ) {}

  private getSystemTemplates() {
    return [
      {
        key: "MANAGER",
        name: "Manager",
        staffRole: StaffRoleEnum.MANAGER,
        permissions: Object.values(PermissionKeyEnum),
        isSystem: true,
        active: true,
      },
      {
        key: "NURSE",
        name: "Nurse",
        staffRole: StaffRoleEnum.NURSE,
        permissions: [
          PermissionKeyEnum.STAFF_READ,
          PermissionKeyEnum.STAFF_ATTENDANCE,
          PermissionKeyEnum.STAFF_LEAVE,
        ],
        isSystem: true,
        active: true,
      },
      {
        key: "RECEPTIONIST",
        name: "Receptionist",
        staffRole: StaffRoleEnum.RECEPTIONIST,
        permissions: [
          PermissionKeyEnum.STAFF_READ,
          PermissionKeyEnum.STAFF_ATTENDANCE,
          PermissionKeyEnum.SALE_READ,
          PermissionKeyEnum.SALE_WRITE,
        ],
        isSystem: true,
        active: true,
      },
      {
        key: "ACCOUNTANT",
        name: "Accountant",
        staffRole: StaffRoleEnum.ACCOUNTANT,
        permissions: [
          PermissionKeyEnum.FINANCE_READ,
          PermissionKeyEnum.FINANCE_WRITE,
          PermissionKeyEnum.SALE_READ,
          PermissionKeyEnum.SALE_WRITE,
          PermissionKeyEnum.PURCHASE_READ,
          PermissionKeyEnum.PURCHASE_WRITE,
          PermissionKeyEnum.INVOICE_READ,
        ],
        isSystem: true,
        active: true,
      },
      {
        key: "LAB_TECHNICIAN",
        name: "Lab Technician",
        staffRole: StaffRoleEnum.LAB_TECHNICIAN,
        permissions: [
          PermissionKeyEnum.STAFF_READ,
          PermissionKeyEnum.SALE_READ,
        ],
        isSystem: true,
        active: true,
      },
    ];
  }

  async listForMerchant(merchantId: Types.ObjectId) {
    const customTemplates = await this.templateModel
      .find({ merchant: merchantId, active: true })
      .sort({ createdAt: -1 })
      .lean();

    return [...this.getSystemTemplates(), ...customTemplates];
  }

  async createForMerchant(
    merchantId: Types.ObjectId,
    dto: CreateStaffRoleTemplateDto,
  ) {
    const key = dto.key.trim().toUpperCase();

    if (this.getSystemTemplates().some((item) => item.key === key)) {
      throw new BadRequestException(
        "Template key conflicts with a system role",
      );
    }

    const existing = await this.templateModel.findOne({
      merchant: merchantId,
      key,
    });

    if (existing) {
      throw new BadRequestException("Template key already exists");
    }

    return this.templateModel.create({
      merchant: merchantId,
      key,
      name: dto.name,
      staffRole: dto.staffRole,
      customRoleName: dto.customRoleName,
      permissions: dto.permissions,
      description: dto.description,
      isSystem: false,
      active: true,
    });
  }

  async updateForMerchant(
    merchantId: Types.ObjectId,
    templateId: Types.ObjectId,
    dto: UpdateStaffRoleTemplateDto,
  ) {
    if (dto.key) {
      const normalizedKey = dto.key.trim().toUpperCase();

      if (
        this.getSystemTemplates().some((item) => item.key === normalizedKey)
      ) {
        throw new BadRequestException(
          "Template key conflicts with a system role",
        );
      }

      const existing = await this.templateModel.findOne({
        merchant: merchantId,
        key: normalizedKey,
        _id: { $ne: templateId },
      });

      if (existing) {
        throw new BadRequestException("Template key already exists");
      }
    }

    const updated = await this.templateModel.findOneAndUpdate(
      { _id: templateId, merchant: merchantId, isSystem: { $ne: true } },
      {
        ...dto,
        key: dto.key ? dto.key.trim().toUpperCase() : undefined,
      },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException("Template not found");
    }

    return updated;
  }

  async deleteForMerchant(
    merchantId: Types.ObjectId,
    templateId: Types.ObjectId,
  ) {
    const deleted = await this.templateModel.findOneAndDelete({
      _id: templateId,
      merchant: merchantId,
      isSystem: { $ne: true },
    });

    if (!deleted) {
      throw new NotFoundException("Template not found");
    }

    return deleted;
  }
}

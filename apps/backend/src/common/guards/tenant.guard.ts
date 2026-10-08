import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { isPublicKey } from "../../common";
import { collectionsName, RolesEnum, Status } from "../../constant";
import { SubscriptionStatus } from "../../constant/enums/status.enum";
import { MerchantDocument } from "../../modules/merchant/schema/merchant.schema";
import { Doctor } from "../../modules/doctor/schema/doctor.schema";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(collectionsName.merchant)
    private readonly merchantModel: Model<MerchantDocument>,
    @InjectModel(collectionsName.doctor)
    private readonly doctorModel: Model<Doctor>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(isPublicKey, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // If no authenticated user, JwtAuthGuard handles authentication
    if (!user) return true;

    // Platform Super Admin and Platform Admin are never restricted by tenant subscription
    if (user.role === RolesEnum.SUPER_ADMIN || user.role === RolesEnum.ADMIN) {
      return true;
    }

    // Check if domain was explicitly queried but not found
    if (req.tenantNotFound) {
      throw new NotFoundException({
        code: "TENANT_NOT_FOUND",
        message: "The requested clinic tenant domain does not exist.",
      });
    }

    // Resolve effective merchant
    let merchant: MerchantDocument | null = req.tenant;

    if (!merchant && user.merchant) {
      merchant = await this.merchantModel.findById(user.merchant);
      if (merchant) {
        req.tenant = merchant;
        req.tenantId = merchant._id;
      }
    }

    // If request has a tenant resolved from hostname/domain, enforce tenant membership
    if (req.tenant && user.merchant) {
      const tenantIdStr = req.tenant._id.toString();
      const userMerchantStr = user.merchant.toString();

      if (tenantIdStr !== userMerchantStr) {
        throw new ForbiddenException({
          code: "CROSS_TENANT_ACCESS_DENIED",
          message: "You are not authorized to access data in this clinic domain.",
        });
      }
    }

    // If this is a tenant-scoped user (has merchant associated)
    if (merchant) {
      // 1. Account Status Enforcement
      if (merchant.status === Status.BANNED) {
        throw new ForbiddenException({
          code: "TENANT_BANNED",
          message: "This clinic account has been banned. Contact platform administration.",
        });
      }

      if (merchant.status === Status.INACTIVE) {
        throw new ForbiddenException({
          code: "TENANT_INACTIVE",
          message: "This clinic account is currently inactive.",
        });
      }

      // 2. Doctor Approval Check
      if (user.role === RolesEnum.DOCTOR) {
        const doctorProfile = await this.doctorModel.findOne({
          $or: [{ user: user._id }, { _id: user._id }],
          merchant: merchant._id,
        });

        if (doctorProfile && doctorProfile.approvalStatus === "PENDING") {
          throw new ForbiddenException({
            code: "DOCTOR_PENDING_APPROVAL",
            message: "Your doctor account is pending approval by the clinic administrator.",
          });
        }
        if (doctorProfile && doctorProfile.approvalStatus === "REJECTED") {
          throw new ForbiddenException({
            code: "DOCTOR_REJECTED",
            message: "Your doctor registration for this clinic was rejected.",
          });
        }
      }

      // 3. Subscription Expiry Enforcement
      const isExemptPath = this.checkIfExemptPath(req.originalUrl || req.url);

      if (!isExemptPath) {
        const now = new Date();
        const isExpired =
          merchant.subscriptionStatus === SubscriptionStatus.EXPIRED ||
          (merchant.subscriptionEndDate && now > new Date(merchant.subscriptionEndDate));

        if (isExpired) {
          throw new ForbiddenException({
            code: "SUBSCRIPTION_EXPIRED",
            message: "Your clinic subscription has expired. Please renew your subscription to continue.",
            subscriptionEndDate: merchant.subscriptionEndDate,
            subscriptionStatus: merchant.subscriptionStatus,
          });
        }
      }
    }

    return true;
  }

  private checkIfExemptPath(url: string): boolean {
    if (!url) return false;
    const cleanUrl = url.toLowerCase();
    return (
      cleanUrl.includes("/subscription") ||
      cleanUrl.includes("/payment") ||
      cleanUrl.includes("/auth/logout") ||
      cleanUrl.includes("/users/profile") ||
      cleanUrl.includes("/users/me") ||
      cleanUrl.includes("/users/current-user") ||
      cleanUrl.includes("/clinic") // to view clinic details/switch
    );
  }
}

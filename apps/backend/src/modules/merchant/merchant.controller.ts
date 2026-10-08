import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
} from "@nestjs/common";
import { MerchantService } from "./merchant.service";
import { CreateMerchantDto } from "./dto/create-merchant.dto";
import { UpdateMerchantDto } from "./dto/update-merchant.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common";
import { RolesEnum, Status } from "../../constant";
import { CurrentTenant } from "../../common/decorators/tenant.decorator";

@Controller("merchants")
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Public()
  @Get("resolve")
  async resolveTenant(
    @Query("domain") queryDomain?: string,
    @Headers("x-tenant-domain") headerDomain?: string,
    @CurrentTenant() currentTenant?: any
  ) {
    if (currentTenant) {
      return {
        _id: currentTenant._id,
        clinicName: currentTenant.clinicName,
        clinicAddress: currentTenant.clinicAddress,
        subdomain: currentTenant.subdomain,
        domain: currentTenant.domain,
        status: currentTenant.status,
        subscriptionStatus: currentTenant.subscriptionStatus,
        subscriptionEndDate: currentTenant.subscriptionEndDate,
      };
    }

    const domainCandidate = (queryDomain || headerDomain || "").trim().toLowerCase();
    if (!domainCandidate) {
      return { resolved: false, message: "No tenant domain specified" };
    }

    const all = await this.merchantService.findAll();
    const matched = all.find(
      (m: any) =>
        m.subdomain?.toLowerCase() === domainCandidate ||
        m.domain?.toLowerCase() === domainCandidate ||
        m.customDomain?.toLowerCase() === domainCandidate
    );

    if (matched) {
      return {
        resolved: true,
        tenant: {
          _id: (matched as any)._id,
          clinicName: (matched as any).clinicName,
          clinicAddress: (matched as any).clinicAddress,
          subdomain: (matched as any).subdomain,
          domain: (matched as any).domain,
          status: (matched as any).status,
          subscriptionStatus: (matched as any).subscriptionStatus,
          subscriptionEndDate: (matched as any).subscriptionEndDate,
        },
      };
    }

    return { resolved: false, message: "Tenant not found for provided domain" };
  }

  @Post()
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  create(@Body() createMerchantDto: CreateMerchantDto) {
    return this.merchantService.create(createMerchantDto);
  }

  @Get("aggregated/overview")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  getAggregatedOverview() {
    return this.merchantService.getMerchantsWithAggregates();
  }

  @Patch(":id/status")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  updateStatus(
    @Param("id") id: string,
    @Body("status") status: Status
  ) {
    return this.merchantService.updateStatus(id, status);
  }

  @Get()
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  findAll() {
    return this.merchantService.findAll();
  }

  @Get(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  findOne(@Param("id") id: string) {
    return this.merchantService.findOneById(id);
  }

  @Patch(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  update(
    @Param("id") id: string,
    @Body() updateMerchantDto: UpdateMerchantDto
  ) {
    return this.merchantService.update(id, updateMerchantDto);
  }

  @Delete(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  remove(@Param("id") id: string) {
    return this.merchantService.remove(id);
  }
}

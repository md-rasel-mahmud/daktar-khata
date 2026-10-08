import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { Types } from "mongoose";
import { IAuthUser } from "../../common";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesEnum } from "../../constant";
import { CreateIncomeDto } from "./dto/create-income.dto";
import { UpdateIncomeDto } from "./dto/update-income.dto";
import { IncomeService } from "./income.service";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PermissionKeyEnum } from "../../constant";

@Controller("income")
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  private resolveMerchantId(user: IAuthUser) {
    return new Types.ObjectId(user.merchant || user._id);
  }

  @Post()
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.FINANCE_WRITE)
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateIncomeDto) {
    return this.incomeService.createForMerchant(
      this.resolveMerchantId(user),
      dto,
    );
  }

  @Get()
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.FINANCE_READ)
  async listMy(
    @AuthUser() user: IAuthUser,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("category") category?: string,
  ) {
    return this.incomeService.listForMerchant(this.resolveMerchantId(user), {
      startDate,
      endDate,
      category,
    });
  }

  @Get("all")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async listAll() {
    return this.incomeService.listAll();
  }

  @Patch(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.FINANCE_WRITE)
  async update(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateIncomeDto,
  ) {
    return this.incomeService.updateForMerchant(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
      dto,
    );
  }

  @Delete(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.FINANCE_WRITE)
  async remove(@AuthUser() user: IAuthUser, @Param("id") id: string) {
    return this.incomeService.deleteForMerchant(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
    );
  }

  @Post("sales")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.SALE_WRITE)
  async createSale(@AuthUser() user: IAuthUser, @Body() dto: CreateIncomeDto) {
    return this.incomeService.createSaleForMerchant(
      this.resolveMerchantId(user),
      dto,
    );
  }

  @Get("sales")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.SALE_READ)
  async listSales(
    @AuthUser() user: IAuthUser,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("category") category?: string,
  ) {
    return this.incomeService.listSalesForMerchant(
      this.resolveMerchantId(user),
      {
        startDate,
        endDate,
        category,
      },
    );
  }
}

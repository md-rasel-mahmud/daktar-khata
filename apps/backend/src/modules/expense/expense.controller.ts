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
import { IAuthUser } from "src/common";
import { AuthUser } from "src/common/decorator/authUser.decorator";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesEnum } from "src/constant";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { ExpenseService } from "./expense.service";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionKeyEnum } from "src/constant";

@Controller("expense")
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  private resolveMerchantId(user: IAuthUser) {
    return new Types.ObjectId(user.merchant || user._id);
  }

  @Post()
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.FINANCE_WRITE)
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateExpenseDto) {
    return this.expenseService.createForMerchant(
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
    return this.expenseService.listForMerchant(this.resolveMerchantId(user), {
      startDate,
      endDate,
      category,
    });
  }

  @Get("all")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async listAll() {
    return this.expenseService.listAll();
  }

  @Patch(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.FINANCE_WRITE)
  async update(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expenseService.updateForMerchant(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
      dto,
    );
  }

  @Delete(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.FINANCE_WRITE)
  async remove(@AuthUser() user: IAuthUser, @Param("id") id: string) {
    return this.expenseService.deleteForMerchant(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
    );
  }

  @Post("purchases")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.PURCHASE_WRITE)
  async createPurchase(
    @AuthUser() user: IAuthUser,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expenseService.createPurchaseForMerchant(
      this.resolveMerchantId(user),
      dto,
    );
  }

  @Get("purchases")
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.PURCHASE_READ)
  async listPurchases(
    @AuthUser() user: IAuthUser,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("category") category?: string,
  ) {
    return this.expenseService.listPurchasesForMerchant(
      this.resolveMerchantId(user),
      {
        startDate,
        endDate,
        category,
      },
    );
  }
}

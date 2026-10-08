import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { StockTransactionService } from "./stock-transaction.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateStockTransactionDto } from "./dto/create-stock-transaction.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser } from "../../common";
import {
  StockTransactionType,
  SupplySource,
} from "../../constant/enums/status.enum";

@Controller("stock-transaction")
export class StockTransactionController {
  constructor(
    private readonly stockTransactionService: StockTransactionService,
  ) {}

  @Post()
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: CreateStockTransactionDto,
  ) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    const performedById = user._id ? new Types.ObjectId(user._id) : undefined;
    return this.stockTransactionService.create(dto, merchantId, performedById);
  }

  @Get()
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findAll(
    @AuthUser() user: IAuthUser,
    @Query("merchant") merchantId?: string,
    @Query("item") itemId?: string,
    @Query("type") type?: StockTransactionType,
    @Query("source") source?: SupplySource,
    @Query("patient") patientId?: string,
    @Query("operation") operationId?: string,
  ) {
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : merchantId;
    return this.stockTransactionService.findAll(
      targetMerchant,
      itemId,
      type,
      source,
      patientId,
      operationId,
    );
  }

  @Get("item/:itemId")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findByItem(
    @AuthUser() user: IAuthUser,
    @Param("itemId") itemId: string,
  ) {
    if (!Types.ObjectId.isValid(itemId)) {
      throw new BadRequestException("Invalid item ID");
    }
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : undefined;
    return this.stockTransactionService.findByItem(itemId, targetMerchant);
  }

  @Get(":id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findOne(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid stock transaction ID");
    }
    return this.stockTransactionService.findOne(id);
  }
}

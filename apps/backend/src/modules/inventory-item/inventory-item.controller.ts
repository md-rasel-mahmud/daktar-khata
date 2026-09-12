import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { InventoryItemService } from "./inventory-item.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { UpdateInventoryItemDto } from "./dto/update-inventory-item.dto";
import { Types } from "mongoose";
import { Roles } from "src/common/decorators/roles.decorator";
import { IAuthUser } from "src/common";
import { InventoryCategory } from "../../constant/enums/status.enum";

@Controller("inventory-item")
export class InventoryItemController {
  constructor(private readonly inventoryItemService: InventoryItemService) {}

  @Post()
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: CreateInventoryItemDto,
  ) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    return this.inventoryItemService.create(dto, merchantId);
  }

  @Get("low-stock")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findLowStock(
    @AuthUser() user: IAuthUser,
    @Query("merchant") merchantId?: string,
  ) {
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : merchantId;
    return this.inventoryItemService.findLowStock(targetMerchant);
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
    @Query("category") category?: InventoryCategory,
    @Query("supplier") supplierId?: string,
    @Query("search") search?: string,
  ) {
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : merchantId;
    return this.inventoryItemService.findAll(
      targetMerchant,
      category,
      supplierId,
      search,
    );
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
      throw new BadRequestException("Invalid inventory item ID");
    }
    return this.inventoryItemService.findOne(id);
  }

  @Put(":id")
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateInventoryItemDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid inventory item ID");
    }
    return this.inventoryItemService.update(id, dto);
  }

  @Delete(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async remove(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid inventory item ID");
    }
    return this.inventoryItemService.softDelete(id);
  }
}

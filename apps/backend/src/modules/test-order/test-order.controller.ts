import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { TestOrderService } from "./test-order.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateTestOrderDto } from "./dto/create-test-order.dto";
import { UpdateTestOrderItemStatusDto } from "./dto/update-test-order-status.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser } from "../../common";

import { Public } from "../../common";

@Controller("test-order")
export class TestOrderController {
  constructor(private readonly testOrderService: TestOrderService) {}

  @Post()
  @Roles(
    RolesEnum.PATIENT,
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateTestOrderDto) {
    const merchantId = user.merchant ? new Types.ObjectId(user.merchant) : undefined;
    return this.testOrderService.create(dto, merchantId);
  }

  @Get()
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.DOCTOR,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findAll(
    @AuthUser() user: IAuthUser,
    @Query("merchant") merchantId?: string,
    @Query("status") status?: string,
  ) {
    const targetMerchant = user.merchant ? user.merchant.toString() : merchantId;
    return this.testOrderService.findAll(targetMerchant, status);
  }

  @Public()
  @Get("queue/public/:station")
  async getPublicStationSnapshot(
    @Param("station") station: string,
    @Query("merchant") merchantId?: string,
  ) {
    return this.testOrderService.getPublicStationSnapshot(station, merchantId);
  }

  @Post("queue/call-next")
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async callNextStationToken(
    @AuthUser() user: IAuthUser,
    @Body("station") station: string,
    @Body("merchant") merchantId?: string,
  ) {
    const targetMerchant = user.merchant ? user.merchant.toString() : merchantId;
    return this.testOrderService.callNextStationToken(station, targetMerchant);
  }

  @Get("encounter/:id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.PATIENT,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async getByEncounter(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid encounter ID");
    }
    return this.testOrderService.getByEncounter(id);
  }

  @Get("patient/:id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.PATIENT,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async getByPatient(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid patient ID");
    }
    return this.testOrderService.getByPatient(id);
  }

  @Patch(":id/item/:itemIndex/status")
  @Roles(
    RolesEnum.STAFF,
    RolesEnum.DOCTOR,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async updateItemStatus(
    @Param("id") id: string,
    @Param("itemIndex") itemIndex: string,
    @Body() dto: UpdateTestOrderItemStatusDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid test order ID");
    }
    return this.testOrderService.updateItemStatus(
      id,
      parseInt(itemIndex, 10),
      dto.status,
    );
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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

@Controller("test-order")
export class TestOrderController {
  constructor(private readonly testOrderService: TestOrderService) {}

  @Post()
  @Roles(RolesEnum.DOCTOR, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateTestOrderDto) {
    return this.testOrderService.create(dto);
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

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
import { TestCatalogService } from "./test-catalog.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateTestCatalogDto } from "./dto/create-test-catalog.dto";
import { UpdateTestCatalogDto } from "./dto/update-test-catalog.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser } from "../../common";

@Controller("test-catalog")
export class TestCatalogController {
  constructor(private readonly testCatalogService: TestCatalogService) {}

  @Post()
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateTestCatalogDto) {
    return this.testCatalogService.create(
      dto,
      new Types.ObjectId(user.merchant),
    );
  }

  @Get()
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findAll(@Query("merchant") merchantId?: string) {
    return this.testCatalogService.findAll(merchantId);
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
      throw new BadRequestException("Invalid test catalog ID");
    }
    return this.testCatalogService.findOne(id);
  }

  @Put(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateTestCatalogDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid test catalog ID");
    }
    return this.testCatalogService.update(id, dto);
  }

  @Delete(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async remove(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid test catalog ID");
    }
    return this.testCatalogService.softDelete(id);
  }
}

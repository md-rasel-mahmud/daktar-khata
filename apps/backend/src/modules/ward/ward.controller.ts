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
import { WardService } from "./ward.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateWardDto } from "./dto/create-ward.dto";
import { UpdateWardDto } from "./dto/update-ward.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser } from "../../common";

@Controller("ward")
export class WardController {
  constructor(private readonly wardService: WardService) {}

  @Post()
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateWardDto) {
    return this.wardService.create(dto, new Types.ObjectId(user.merchant));
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
    return this.wardService.findAll(merchantId);
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
      throw new BadRequestException("Invalid ward ID");
    }
    return this.wardService.findOne(id);
  }

  @Put(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async update(@Param("id") id: string, @Body() dto: UpdateWardDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ward ID");
    }
    return this.wardService.update(id, dto);
  }

  @Delete(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async remove(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ward ID");
    }
    return this.wardService.softDelete(id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import { MerchantPGService } from "./merchant-pg.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateMerchantPGDto } from "./dto/create-merchant-pg.dto";
import { UpdateMerchantPGDto } from "./dto/update-merchant-pg.dto";
import { Types } from "mongoose";
import { Roles } from "src/common/decorators/roles.decorator";
import { IAuthUser } from "src/common";

@Controller("merchant-pg")
export class MerchantPGController {
  constructor(private readonly merchantPGService: MerchantPGService) {}

  @Post()
  @Roles(RolesEnum.MERCHANT)
  async create(@AuthUser() user: any, @Body() dto: CreateMerchantPGDto) {
    return this.merchantPGService.create(new Types.ObjectId(user._id), dto);
  }

  @Get()
  @Roles(RolesEnum.MERCHANT)
  async listMy(@AuthUser() user: IAuthUser) {
    return this.merchantPGService.getSinglePG(
      new Types.ObjectId(user.merchant)
    );
  }

  @Get("all")
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  async listAll() {
    return this.merchantPGService.listAll();
  }

  @Get(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async getById(@Param("id") id: string) {
    return this.merchantPGService.getById(new Types.ObjectId(id));
  }

  @Patch()
  @Roles(RolesEnum.MERCHANT)
  async update(@AuthUser() user: IAuthUser, @Body() dto: UpdateMerchantPGDto) {
    return this.merchantPGService.updateForMerchant(
      new Types.ObjectId(user.merchant),
      dto
    );
  }

  @Delete(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async remove(@AuthUser() user: any, @Param("id") id: string) {
    return this.merchantPGService.deleteForMerchant(
      new Types.ObjectId(user._id),
      new Types.ObjectId(id)
    );
  }
}

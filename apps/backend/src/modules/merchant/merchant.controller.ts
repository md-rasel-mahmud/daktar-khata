import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { MerchantService } from "./merchant.service";
import { CreateMerchantDto } from "./dto/create-merchant.dto";
import { UpdateMerchantDto } from "./dto/update-merchant.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesEnum } from "../../constant";

@Controller("merchants")
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post()
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  create(@Body() createMerchantDto: CreateMerchantDto) {
    return this.merchantService.create(createMerchantDto);
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

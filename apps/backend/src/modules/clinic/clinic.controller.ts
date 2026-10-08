import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { ClinicService } from "./clinic.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateClinicDto } from "./dto/create-clinic.dto";
import { UpdateClinicDto } from "./dto/update-clinic.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("clinic")
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Post()
  @Roles(RolesEnum.MERCHANT)
  async create(@AuthUser() user: any, @Body() dto: CreateClinicDto) {
    return this.clinicService.createForMerchant(
      new Types.ObjectId(user._id),
      dto
    );
  }

  @Get()
  @Roles(RolesEnum.MERCHANT)
  async listMy(@AuthUser() user: any) {
    return this.clinicService.listForMerchant(new Types.ObjectId(user._id));
  }

  @Get("all")
  @Roles(RolesEnum.SUPER_ADMIN)
  async listAll() {
    return this.clinicService.listAll();
  }

  @Put(":id")
  @Roles(RolesEnum.MERCHANT)
  async update(
    @AuthUser() user: any,
    @Param("id") id: string,
    @Body() dto: UpdateClinicDto
  ) {
    return this.clinicService.updateForMerchant(
      new Types.ObjectId(user._id),
      new Types.ObjectId(id),
      dto
    );
  }

  @Delete(":id")
  @Roles(RolesEnum.MERCHANT)
  async remove(@AuthUser() user: any, @Param("id") id: string) {
    return this.clinicService.deleteForMerchant(
      new Types.ObjectId(user._id),
      new Types.ObjectId(id)
    );
  }
}

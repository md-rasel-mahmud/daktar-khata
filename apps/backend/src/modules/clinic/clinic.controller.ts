import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ClinicService } from "./clinic.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateClinicDto } from "./dto/create-clinic.dto";
import { UpdateClinicDto } from "./dto/update-clinic.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common";

@Controller("clinic")
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Public()
  @Get("public-list")
  async getPublicClinics(@Query("merchantId") merchantId?: string) {
    if (merchantId) {
      return this.clinicService.listForMerchant(new Types.ObjectId(merchantId));
    }
    return this.clinicService.listAll();
  }

  @Post()
  @Roles(RolesEnum.MERCHANT)
  async create(@AuthUser() user: any, @Body() dto: CreateClinicDto) {
    const merchantId = user.merchant || user._id;
    return this.clinicService.createForMerchant(
      new Types.ObjectId(merchantId),
      dto
    );
  }

  @Get()
  @Roles(RolesEnum.MERCHANT, RolesEnum.DOCTOR, RolesEnum.STAFF)
  async listMy(@AuthUser() user: any) {
    const merchantId = user.merchant || user._id;
    return this.clinicService.listForMerchant(new Types.ObjectId(merchantId));
  }

  @Get("all")
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
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
    const merchantId = user.merchant || user._id;
    return this.clinicService.updateForMerchant(
      new Types.ObjectId(merchantId),
      new Types.ObjectId(id),
      dto
    );
  }

  @Delete(":id")
  @Roles(RolesEnum.MERCHANT)
  async remove(@AuthUser() user: any, @Param("id") id: string) {
    const merchantId = user.merchant || user._id;
    return this.clinicService.deleteForMerchant(
      new Types.ObjectId(merchantId),
      new Types.ObjectId(id)
    );
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { BedService } from "./bed.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateBedDto } from "./dto/create-bed.dto";
import { UpdateBedDto } from "./dto/update-bed.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser } from "../../common";
import { BedStatus } from "../../constant/enums/status.enum";

@Controller("bed")
export class BedController {
  constructor(private readonly bedService: BedService) {}

  @Post()
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateBedDto) {
    return this.bedService.create(dto, new Types.ObjectId(user.merchant));
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
    @Query("ward") wardId?: string,
    @Query("room") roomId?: string,
    @Query("status") status?: string,
    @Query("merchant") merchantId?: string,
  ) {
    return this.bedService.findAll(wardId, roomId, status, merchantId);
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
      throw new BadRequestException("Invalid bed ID");
    }
    return this.bedService.findOne(id);
  }

  @Put(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async update(@Param("id") id: string, @Body() dto: UpdateBedDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid bed ID");
    }
    return this.bedService.update(id, dto);
  }

  @Patch(":id/status")
  @Roles(RolesEnum.STAFF, RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async updateStatus(
    @Param("id") id: string,
    @Body("status") status: BedStatus,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid bed ID");
    }
    return this.bedService.updateStatus(id, status);
  }
}

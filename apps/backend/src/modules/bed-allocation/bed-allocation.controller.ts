import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  BadRequestException,
} from "@nestjs/common";
import { BedAllocationService } from "./bed-allocation.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { AllocateBedDto, TransferBedDto } from "./dto/allocate-bed.dto";
import { Types } from "mongoose";
import { Roles } from "src/common/decorators/roles.decorator";
import { IAuthUser } from "src/common";

@Controller("bed-allocation")
export class BedAllocationController {
  constructor(private readonly bedAllocationService: BedAllocationService) {}

  @Post()
  @Roles(RolesEnum.STAFF, RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async allocate(@AuthUser() user: IAuthUser, @Body() dto: AllocateBedDto) {
    return this.bedAllocationService.allocate(
      dto,
      new Types.ObjectId(user._id),
      new Types.ObjectId(user.merchant),
    );
  }

  @Post(":id/release")
  @Roles(RolesEnum.STAFF, RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async release(@AuthUser() user: IAuthUser, @Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid allocation ID");
    }
    return this.bedAllocationService.release(id, new Types.ObjectId(user._id));
  }

  @Post(":id/transfer")
  @Roles(RolesEnum.STAFF, RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  async transfer(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: TransferBedDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid allocation ID");
    }
    return this.bedAllocationService.transfer(
      id,
      dto.newBed,
      new Types.ObjectId(user._id),
      new Types.ObjectId(user.merchant),
    );
  }

  @Get("patient/:id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async getByPatient(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid patient ID");
    }
    return this.bedAllocationService.getByPatient(id);
  }
}

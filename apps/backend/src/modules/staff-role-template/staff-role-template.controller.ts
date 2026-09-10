import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { Types } from "mongoose";
import { IAuthUser } from "src/common";
import { AuthUser } from "src/common/decorator/authUser.decorator";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { Roles } from "src/common/decorators/roles.decorator";
import { PermissionKeyEnum, RolesEnum } from "src/constant";
import { CreateStaffRoleTemplateDto } from "./dto/create-staff-role-template.dto";
import { UpdateStaffRoleTemplateDto } from "./dto/update-staff-role-template.dto";
import { StaffRoleTemplateService } from "./staff-role-template.service";

@Controller("staff-role-templates")
export class StaffRoleTemplateController {
  constructor(private readonly templateService: StaffRoleTemplateService) {}

  private resolveMerchantId(user: IAuthUser) {
    return new Types.ObjectId(user.merchant || user._id);
  }

  @Get()
  @Roles(RolesEnum.MERCHANT, RolesEnum.STAFF)
  @Permissions(PermissionKeyEnum.STAFF_READ)
  async list(@AuthUser() user: IAuthUser) {
    return this.templateService.listForMerchant(this.resolveMerchantId(user));
  }

  @Post()
  @Roles(RolesEnum.MERCHANT)
  @Permissions(PermissionKeyEnum.STAFF_UPDATE)
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: CreateStaffRoleTemplateDto,
  ) {
    return this.templateService.createForMerchant(
      this.resolveMerchantId(user),
      dto,
    );
  }

  @Patch(":id")
  @Roles(RolesEnum.MERCHANT)
  @Permissions(PermissionKeyEnum.STAFF_UPDATE)
  async update(
    @AuthUser() user: IAuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateStaffRoleTemplateDto,
  ) {
    return this.templateService.updateForMerchant(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
      dto,
    );
  }

  @Delete(":id")
  @Roles(RolesEnum.MERCHANT)
  @Permissions(PermissionKeyEnum.STAFF_UPDATE)
  async remove(@AuthUser() user: IAuthUser, @Param("id") id: string) {
    return this.templateService.deleteForMerchant(
      this.resolveMerchantId(user),
      new Types.ObjectId(id),
    );
  }
}

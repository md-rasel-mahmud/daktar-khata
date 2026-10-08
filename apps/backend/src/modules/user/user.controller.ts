import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Request,
  Patch,
  BadRequestException,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Connection, Types } from "mongoose";
import { RolesEnum, Status } from "../../constant";
import { AuthService } from "../auth/auth.service";
import { InjectConnection } from "@nestjs/mongoose";
import { RegisterDto } from "../auth/dto/auth.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get("/profile")
  async getCurrentUser(@Request() req: any) {
    const requestUser = req.user;

    if (!requestUser._id) {
      throw new BadRequestException("User not found");
    }

    if (requestUser.role === RolesEnum.STAFF) {
      return {
        data: {
          user: {
            _id: requestUser._id,
            role: requestUser.role,
            phone: requestUser.phone,
            email: requestUser.email,
            merchant: requestUser.merchant,
            permissions: requestUser.permissions || [],
            staffRole: requestUser.staffRole,
            customRoleName: requestUser.customRoleName,
          },
          _id: requestUser._id,
          name: requestUser.staffName,
          phone: requestUser.phone,
          email: requestUser.email,
          profileType: requestUser.role,
        },
        message: "User fetched successfully",
      };
    }

    const user = await this.userService.getUserCurrentUser(requestUser);

    return { data: user, message: "User fetched successfully" };
  }

  // update current user
  @Patch("/profile")
  async updateCurrentUser(
    @Request() req: any,
    @Body() updateUserDto: RegisterDto,
  ) {
    const requestUser = req.user;

    if (!requestUser._id) {
      throw new BadRequestException("User not found");
    }

    const user = await this.userService.updateCurrentUser(
      requestUser,
      updateUserDto,
    );

    return { data: user, message: "User updated successfully" };
  }

  // Super Admin administration of Platform Admins
  @Get("/admins")
  @Roles(RolesEnum.SUPER_ADMIN)
  async getPlatformAdmins() {
    const data = await this.userService.listPlatformAdmins();
    return { data, message: "Platform admins retrieved successfully" };
  }

  @Post("/admins")
  @Roles(RolesEnum.SUPER_ADMIN)
  async createPlatformAdmin(@Body() dto: CreateUserDto) {
    const data = await this.userService.createAdmin(dto);
    return { data, message: "Platform admin created successfully" };
  }

  @Patch("/admins/:id/status")
  @Roles(RolesEnum.SUPER_ADMIN)
  async updateAdminStatus(
    @Param("id") id: string,
    @Body("status") status: Status
  ) {
    const data = await this.userService.updateAdminStatus(new Types.ObjectId(id), status);
    return { data, message: "Platform admin status updated successfully" };
  }
}

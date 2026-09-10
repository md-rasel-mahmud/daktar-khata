import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Request,
  Patch,
  BadRequestException,
  Query,
  Delete,
  Req,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Connection, Types } from "mongoose";
import { UpdateUserDto } from "./dto/update-user.dto";
import { RolesEnum } from "../../constant";
import { AuthService } from "src/modules/auth/auth.service";
import { InjectConnection } from "@nestjs/mongoose";
import { RegisterDto } from "src/modules/auth/dto/auth.dto";
import { Roles } from "src/common/decorators/roles.decorator";

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
}

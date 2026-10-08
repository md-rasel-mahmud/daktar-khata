import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { Public } from "../../common";
import { AuthDto, RegisterDto } from "./dto/auth.dto";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { RolesEnum } from "../../constant";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { CurrentTenant } from "../../common/decorators/tenant.decorator";

@ApiTags("Authentication")
@Controller("auth")
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  @Post("/login")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "User login" })
  @ApiBody({
    type: AuthDto,
    description: "Login credentials for user authentication",
  })
  @ApiResponse({
    status: 200,
    description: "Login successful, returns user data and token",
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials",
  })
  async login(
    @Body() authDto: AuthDto,
    @CurrentTenant() tenant?: any
  ) {
    const res = await this.authService.logIn(authDto, tenant);

    return { data: res, message: "Login success" };
  }

  @Post("/signup")
  @Public()
  @ApiOperation({ summary: "User registration" })
  @ApiBody({
    type: RegisterDto,
    description:
      "Registration details for creating a new user account (PATIENT, MERCHANT, or DOCTOR).",
  })
  @ApiResponse({
    status: 201,
    description: "User registration successful",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid role or registration data",
  })
  async signup(
    @Body() createUserDto: RegisterDto,
    @CurrentTenant() currentTenant?: any
  ) {
    const allowedRoles = [RolesEnum.PATIENT, RolesEnum.MERCHANT, RolesEnum.DOCTOR];
    if (createUserDto.role && !allowedRoles.includes(createUserDto.role)) {
      throw new BadRequestException(
        "Self-registration is only allowed for Patient, Clinic Owner, or Doctor"
      );
    }

    const session = await this.connection.startSession();

    try {
      const result = await this.authService.signup(
        {
          ...createUserDto,
          role: createUserDto.role || RolesEnum.PATIENT,
          merchant: createUserDto.merchant || (currentTenant ? currentTenant._id?.toString() : undefined),
        },
        session
      );

      return {
        data: result,
        message: `Welcome to Daktar Khata, Signup successful`,
      };
    } catch (error) {
      throw error;
    }
  }
}

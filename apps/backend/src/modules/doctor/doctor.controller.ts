import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { DoctorService } from "./doctor.service";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { UpdateDoctorDto } from "./dto/update-doctor.dto";
import { RolesEnum } from "../../constant";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { IAuthUser } from "../../common";

@Controller("doctors")
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Post()
  @Roles(RolesEnum.MERCHANT)
  async createDoctorByMerchant(
    @Body() createDoctorDto: CreateDoctorDto,
    @AuthUser() authUser: IAuthUser,
  ) {
    // return this.doctorService.create(createDoctorDto);

    const session = await this.connection.startSession();

    try {
      const result = await this.doctorService.createDoctorByMerchant(
        {
          ...createDoctorDto,
          role: RolesEnum.DOCTOR,
        },
        authUser,
        session,
      );

      return {
        data: result,
        message: `Doctor Create Successful`,
      };
    } catch (error) {
      throw error; // Handle errors appropriately
    }
  }

  @Get()
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  findAll(@AuthUser() authUser: IAuthUser) {
    return this.doctorService.findAll(authUser);
  }

  @Get("options")
  @Roles(
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
    RolesEnum.PATIENT,
  )
  findAllForOptions(@AuthUser() authUser: IAuthUser) {
    return this.doctorService.getAllForOptions(authUser);
  }

  @Get(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  findOne(@Param("id") id: string) {
    return this.doctorService.findOne(id);
  }

  @Patch(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  update(@Param("id") id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorService.update(id, updateDoctorDto);
  }

  @Delete(":id")
  @Roles(RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  remove(@Param("id") id: string) {
    return this.doctorService.remove(id);
  }
}

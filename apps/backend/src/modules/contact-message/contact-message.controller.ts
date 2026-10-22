import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ContactMessageService } from "./contact-message.service";
import {
  CreateContactMessageDto,
  UpdateContactMessageStatusDto,
} from "./dto/contact-message.dto";
import { Public } from "../../common";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesEnum } from "../../constant";

@Controller("contact-messages")
export class ContactMessageController {
  constructor(private readonly contactService: ContactMessageService) {}

  @Public()
  @Post()
  async create(@Body() dto: CreateContactMessageDto) {
    return this.contactService.create(dto);
  }

  @Get()
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  async findAll(@Query("status") status?: string) {
    return this.contactService.findAll(status);
  }

  @Get(":id")
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  async findOne(@Param("id") id: string) {
    return this.contactService.findOne(id);
  }

  @Patch(":id/status")
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateContactMessageStatusDto,
  ) {
    return this.contactService.updateStatus(id, dto);
  }

  @Delete(":id")
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  async remove(@Param("id") id: string) {
    return this.contactService.remove(id);
  }
}

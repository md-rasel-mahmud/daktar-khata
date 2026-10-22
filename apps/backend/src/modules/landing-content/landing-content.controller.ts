import { Body, Controller, Get, Put } from "@nestjs/common";
import { LandingContentService } from "./landing-content.service";
import { Public } from "../../common";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesEnum } from "../../constant";

@Controller("landing-content")
export class LandingContentController {
  constructor(private readonly service: LandingContentService) {}

  @Public()
  @Get()
  async get() {
    return this.service.get();
  }

  @Put()
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  async update(@Body() body: any) {
    return this.service.update(body);
  }
}

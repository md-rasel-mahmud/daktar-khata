import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
} from "@nestjs/common";
import { BlogService } from "./blog.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { Public } from "../../common";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesEnum } from "../../constant";

@Controller("blogs")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  async create(@Body() createBlogDto: CreateBlogDto, @Request() req: any) {
    return this.blogService.create(createBlogDto, req.user);
  }

  @Public()
  @Get()
  async findAll(@Query("all") all?: string, @Query("limit") limit?: string) {
    const publishedOnly = all !== "true";
    const take = limit ? parseInt(limit, 10) : 20;
    return this.blogService.findAll(publishedOnly, take);
  }

  @Public()
  @Get(":slugOrId")
  async findOne(@Param("slugOrId") slugOrId: string) {
    return this.blogService.findBySlugOrId(slugOrId);
  }

  @Put(":id")
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  async update(
    @Param("id") id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogService.update(id, updateBlogDto);
  }

  @Patch(":id")
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  async patch(
    @Param("id") id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogService.update(id, updateBlogDto);
  }

  @Delete(":id")
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  async remove(@Param("id") id: string) {
    return this.blogService.remove(id);
  }
}

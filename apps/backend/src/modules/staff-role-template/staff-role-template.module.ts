import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { collectionsName } from "../../constant";
import { StaffRoleTemplateController } from "./staff-role-template.controller";
import { StaffRoleTemplateService } from "./staff-role-template.service";
import {
  StaffRoleTemplate,
  StaffRoleTemplateSchema,
} from "./schema/staff-role-template.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: collectionsName.staffRoleTemplate,
        schema: StaffRoleTemplateSchema,
      },
    ]),
  ],
  providers: [StaffRoleTemplateService],
  controllers: [StaffRoleTemplateController],
  exports: [StaffRoleTemplateService],
})
export class StaffRoleTemplateModule {}

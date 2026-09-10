import { PartialType } from "@nestjs/mapped-types";
import { CreateStaffRoleTemplateDto } from "./create-staff-role-template.dto";

export class UpdateStaffRoleTemplateDto extends PartialType(
  CreateStaffRoleTemplateDto,
) {}

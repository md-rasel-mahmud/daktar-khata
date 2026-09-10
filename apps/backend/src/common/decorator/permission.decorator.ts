import { SetMetadata } from "@nestjs/common";
import { RolesEnum } from "../../constant";

export const PERMISSION_KEY = "permission";
export const Permission = (permissions: RolesEnum[]) =>
  SetMetadata(PERMISSION_KEY, permissions);

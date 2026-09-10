import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesEnum } from "src/constant";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPerms || requiredPerms.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return false;

    if (
      [RolesEnum.MERCHANT, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN].includes(
        user.role,
      )
    ) {
      return true;
    }

    if (Array.isArray(user.permissions) && user.permissions.length) {
      return requiredPerms.every((p) => user.permissions.includes(p));
    }

    return false;
  }
}

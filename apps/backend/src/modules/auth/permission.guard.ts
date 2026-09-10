import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSION_KEY } from "../../common/decorator/permission.decorator";
import { RolesEnum } from "../../constant";
import { isPublicKey } from "../../common";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // return true;
    const permission = this.reflector.getAllAndOverride<RolesEnum[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()]
    );

    //check the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(isPublicKey, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;
    // Admin has full access
    if (user.role === RolesEnum.ADMIN || user.role === RolesEnum.SUPER_ADMIN)
      return true;

    if (!permission) return false;
    return permission.includes(user.role);
  }
}

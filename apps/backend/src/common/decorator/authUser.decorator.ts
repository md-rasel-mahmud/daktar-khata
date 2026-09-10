import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IAuthUser } from "../interfaces/auth-user.interface";

export const AuthUser = createParamDecorator(
  (_data, ctx: ExecutionContext): IAuthUser => {
    const req = ctx.switchToHttp().getRequest();
    return {
      _id: req.user._id,
      admin: req.user.admin,
      role: req.user.role,
      merchant: req.user.merchant,
    };
  }
);

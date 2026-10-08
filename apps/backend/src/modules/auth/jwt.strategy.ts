import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { IAuthUser } from "../../common";
import { appConfig } from "../../config";
import { RolesEnum } from "../../constant";
import { StaffService } from "../staff/staff.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly staffService: StaffService,
  ) {
    const config = appConfig();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt_secret,
    });
  }

  async validate(payload: IAuthUser) {
    const user = await this.userService.getUserById(payload._id);

    if (!user) throw new UnauthorizedException();

    const basePayload: IAuthUser = {
      _id: user._id,
      role: user.role,
      phone: user.phone,
      email: user.email,
      merchant: payload?.merchant,
    };

    if (user.role === RolesEnum.STAFF) {
      const staff = await this.staffService.findByUserId(user._id);
      if (staff) {
        basePayload.merchant = staff.merchant;
        basePayload.permissions = staff.permissions || [];
        basePayload.staffRole = staff.staffRole;
        basePayload.customRoleName = staff.customRoleName;
        basePayload.staffName = staff.name;
      }
    }

    return basePayload;
  }
}

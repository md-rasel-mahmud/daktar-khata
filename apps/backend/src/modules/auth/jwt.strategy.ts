import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { IAuthUser } from "../../common";
import { appConfig } from "../../config";
import { RolesEnum } from "../../constant";
import { StaffService } from "../staff/staff.service";
import { Types } from "mongoose";

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
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: IAuthUser) {
    const user = await this.userService.getUserById(payload._id);

    if (!user) throw new UnauthorizedException();

    // Determine active clinic: prioritize x-clinic-id header, fallback to payload/user clinic
    const headerClinic = req?.headers?.["x-clinic-id"] as string | undefined;
    let activeClinic: Types.ObjectId | undefined = undefined;

    if (headerClinic && Types.ObjectId.isValid(headerClinic)) {
      activeClinic = new Types.ObjectId(headerClinic);
    } else if (payload?.clinic && Types.ObjectId.isValid(payload.clinic as any)) {
      activeClinic = new Types.ObjectId(payload.clinic as any);
    } else if (user.clinic) {
      activeClinic = user.clinic;
    }

    const basePayload: IAuthUser = {
      _id: user._id,
      role: user.role,
      phone: user.phone,
      email: user.email,
      merchant: payload?.merchant
        ? new Types.ObjectId(payload.merchant as any)
        : user.merchant,
      clinic: activeClinic,
    };

    if (user.role === RolesEnum.STAFF) {
      const staff = await this.staffService.findByUserId(user._id);
      if (staff) {
        basePayload.merchant = staff.merchant;
        if (staff.clinic && !activeClinic) {
          basePayload.clinic = staff.clinic;
        }
        basePayload.permissions = staff.permissions || [];
        basePayload.staffRole = staff.staffRole;
        basePayload.customRoleName = staff.customRoleName;
        basePayload.staffName = staff.name;
      }
    }

    return basePayload;
  }
}

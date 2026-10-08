import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";

import { JwtModule } from "@nestjs/jwt";
import { appConfig } from "../../config";
import { UserModule } from "../user/user.module";
import { JwtStrategy } from "./jwt.strategy";
import { PatientService } from "../patient/patient.service";
import { PatientModule } from "../patient/patient.module";
import { AuthController } from "./auth.controller";
import { MerchantModule } from "../merchant/merchant.module";
import { DoctorModule } from "../doctor/doctor.module";
import { StaffModule } from "../staff/staff.module";

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory() {
        const config = appConfig();
        return {
          secret: config.jwt_secret,
          signOptions: {
            expiresIn: config.access_token_expiration_minute,
          },
        };
      },
    }),
    forwardRef(() => UserModule),
    PatientModule,
    DoctorModule,
    MerchantModule,
    forwardRef(() => StaffModule),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService, PatientService],
  exports: [AuthService],
})
export class AuthModule {}

import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";

import { JwtModule } from "@nestjs/jwt";
import { appConfig } from "../../config";
import { UserModule } from "../user/user.module";
import { JwtStrategy } from "./jwt.strategy";
import { PatientService } from "src/modules/patient/patient.service";
import { PatientModule } from "src/modules/patient/patient.module";
import { AuthController } from "src/modules/auth/auth.controller";
import { MerchantModule } from "src/modules/merchant/merchant.module";
import { DoctorModule } from "src/modules/doctor/doctor.module";
import { StaffModule } from "src/modules/staff/staff.module";

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

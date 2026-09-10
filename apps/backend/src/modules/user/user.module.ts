import { forwardRef, Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { collectionsName } from "../../constant";
import { UserSchema } from "./schema/user.schema";
import { AuthModule } from "src/modules/auth/auth.module";
import { PatientModule } from "src/modules/patient/patient.module";
import { JwtModule } from "@nestjs/jwt";
import { appConfig } from "src/config";
import { MerchantModule } from "src/modules/merchant/merchant.module";
import { DoctorModule } from "src/modules/doctor/doctor.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.user, schema: UserSchema },
    ]),
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
    PatientModule,
    MerchantModule,
    DoctorModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule],
})
export class UserModule {}

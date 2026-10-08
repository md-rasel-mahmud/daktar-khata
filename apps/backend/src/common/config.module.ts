import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LoggerMiddleware } from "./logger/logger/logger.middleware";
import { TenantMiddleware } from "./middleware/tenant.middleware";
import { JwtAuthGuard } from "../modules/auth/auth.guard";
import { APP_GUARD } from "@nestjs/core";
import { PermissionsGuard } from "./guards/permissions.guard";
import { RolesGuard } from "./guards/roles.guard";
import { TenantGuard } from "./guards/tenant.guard";
import { collectionsName } from "../constant";
import { MerchantSchema } from "../modules/merchant/schema/merchant.schema";
import { DoctorSchema } from "../modules/doctor/schema/doctor.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.merchant, schema: MerchantSchema },
      { name: collectionsName.doctor, schema: DoctorSchema },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
  exports: [MongooseModule],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, TenantMiddleware).forRoutes("*");
  }
}

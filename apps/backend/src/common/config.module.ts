import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { LoggerMiddleware } from "./logger/logger/logger.middleware";
import { JwtAuthGuard } from "../modules/auth/auth.guard";
import { APP_GUARD } from "@nestjs/core";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
// import { PermissionGuard } from '../auth/permission.guard';

@Module({
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
  ],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}

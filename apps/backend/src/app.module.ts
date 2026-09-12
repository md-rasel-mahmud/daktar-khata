import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { appConfig } from "./config/app.config";
import { UserModule } from "./modules/user/user.module";
import * as Joi from "@hapi/joi";
import * as path from "path";
import { AcceptLanguageResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import { ThrottlerModule } from "@nestjs/throttler";

import { CommonModule } from "./common/config.module";
import { AuthModule } from "./modules/auth/auth.module";
import { DoctorModule } from "src/modules/doctor/doctor.module";
import { PatientModule } from "src/modules/patient/patient.module";
import { ClinicModule } from "./modules/clinic/clinic.module";
import { SubscriptionModule } from "./modules/subscription/subscription.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { StaffModule } from "./modules/staff/staff.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { DatabaseSeederService } from "./seeder/database-seeder.service";
import { PermissionsModule } from "src/modules/permissions/permissions.module";
import { AppointmentModule } from "src/modules/appointment/appointment.module";
import { MerchantPGModule } from "src/modules/merchant-pg/merchant-pg.module";
import { IncomeModule } from "src/modules/income/income.module";
import { ExpenseModule } from "src/modules/expense/expense.module";
import { FinanceModule } from "src/modules/finance/finance.module";
import { StaffRoleTemplateModule } from "src/modules/staff-role-template/staff-role-template.module";
import { MedicalRecordModule } from "src/modules/medical-records/medical-record.module";
import { QueueModule } from "./modules/queue/queue.module";
import { EncounterModule } from "./modules/encounter/encounter.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: Joi.object({
        MONGODB_URL: Joi.required(),
        JWT_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRATION_MINUTES: Joi.string().required(),
        JWT_REFRESH_EXPIRATION_DAYS: Joi.number().required(),
        MASTER_PASSWORD: Joi.string().required(),
      }),
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    ScheduleModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: "en",
      loaderOptions: {
        path: path.join(__dirname, "/i18n/"),
        watch: true,
      },
      fallbacks: {
        "en-*": "en",
        "bn-*": "bn",
      },
      resolvers: [
        { use: QueryResolver, options: ["lang"] },
        AcceptLanguageResolver,
      ],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5,
      },
    ]),
    CommonModule,
    UserModule,
    AuthModule,
    DoctorModule,
    PatientModule,
    ClinicModule,
    SubscriptionModule,
    PaymentModule,
    StaffModule,
    DashboardModule,
    PermissionsModule,
    AppointmentModule,
    MerchantPGModule,
    IncomeModule,
    ExpenseModule,
    FinanceModule,
    StaffRoleTemplateModule,
    MedicalRecordModule,
    QueueModule,
    EncounterModule,
  ],
  controllers: [],
  providers: [DatabaseSeederService],
})
export class AppModule {}

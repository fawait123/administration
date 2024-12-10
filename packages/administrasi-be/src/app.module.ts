import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './api/auth/auth.module';
import { UserModule } from './api/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ActivityModule } from './api/activity/activity.module';
import { EmployeeModule } from './api/employee/employee.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtConstant } from 'libs/constant/auth.constant';
import { CompanyModule } from './api/company/company.module';
import { MemberWorkResultModule } from './api/member-work-result/member-work-result.module';
import { InvoiceModule } from './api/invoice/invoice.module';
import { SettingModule } from './api/setting/setting.module';
import { RoleModule } from './api/role/role.module';
import { AuthMiddleware } from 'libs/middlewares/auth.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduleService } from './api/schedule/schedule.service';
import { NotificationService } from './api/notification/notification.service';
import { NotificationModule } from './api/notification/notification.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AccountingModule } from './api/accounting/accounting.module';
import { WorksheetModule } from './api/worksheet/worksheet.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: JwtConstant.secret,
      signOptions: {
        expiresIn: '365d',
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Mengatur agar modul ini tersedia di seluruh aplikasi
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ActivityModule,
    EmployeeModule,
    CompanyModule,
    MemberWorkResultModule,
    InvoiceModule,
    SettingModule,
    RoleModule,
    NotificationModule,
    DashboardModule,
    AccountingModule,
    WorksheetModule,
  ],
  controllers: [],
  providers: [AppService, ScheduleService, NotificationService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({
        method: RequestMethod.POST,
        path: '/auth/login',
      })
      .forRoutes('*');
  }
}

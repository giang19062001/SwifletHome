import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { QuestionAdminModule } from './modules/question/admin/question.module';
import { AnswerAdminModule } from './modules/answer/admin/answer.module';
import { UploadAdminModule } from './modules/upload/upload.module';
import { AuthAdminModule } from './modules/auth/admin/auth.module';
import { AnswerAppModule } from './modules/answer/app/answer.module';
import { QuestionAppModule } from './modules/question/app/question.module';
import { HomeSaleAdminModule } from './modules/homeSale/admin/homeSale.module';
import { HomeSaleAppModule } from './modules/homeSale/app/homeSale.module';
import { HomeSubmitAppModule } from './modules/homeSubmit/app/homeSubmit.module';
import { HomeSubmitAdminModule } from './modules/homeSubmit/admin/homeSubmit.module';
import { BlogAdminModule } from './modules/blog/admin/blog.module';
import { CodeModule } from './modules/code/code.module';
import { DoctorAppModule } from './modules/doctor/app/doctor.module';
import { DoctorAdminModule } from './modules/doctor/admin/doctor.module';
import { LoggerModule } from './common/logger/logger.module';
import { AuthAppModule } from './modules/auth/app/auth.module';
import { OtpAppModule } from './modules/otp/otp.module';
import { UserAppModule } from './modules/user/app/user.module';
import { UserPaymentAppModule } from './modules/userPayment/app/userPayment.module';
import { UserAdminModule } from './modules/user/admin/user.module';
import { InfoAppModule } from './modules/info/app/info.module';
import { CategoryAdminModule } from './modules/category/admin/category.module';
import { ScreenAppModule } from './modules/screen/app/screen.module';
import { ObjectAdminModule } from './modules/object/admin/object.module';
import { ScreenAdminModule } from './modules/screen/admin/screen.module';
import { InfoAdminModule } from './modules/info/admin/info.module';
import { PackageAdminModule } from './modules/package/admin/package.module';
import { IpMiddleware } from './middleware/ip.middleware';
import { CornModule } from './common/corn/corn.module';
import { UserPaymentAdminModule } from './modules/userPayment/admin/userPayment.module';

@Module({
  imports: [
    // global
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CornModule,
    DatabaseModule,
    LoggerModule,
    CodeModule,

    //app
    AuthAppModule,
    OtpAppModule,
    UserAppModule,
    UserPaymentAppModule,
    QuestionAppModule,
    AnswerAppModule,
    DoctorAppModule,
    HomeSaleAppModule,
    HomeSubmitAppModule,
    ScreenAppModule,
    InfoAppModule,

    //admin
    AuthAdminModule,
    UserAdminModule,
    CategoryAdminModule,
    ObjectAdminModule,
    QuestionAdminModule,
    AnswerAdminModule,
    UploadAdminModule,
    HomeSaleAdminModule,
    HomeSubmitAdminModule,
    BlogAdminModule,
    DoctorAdminModule,
    ScreenAdminModule,
    InfoAdminModule,
    PackageAdminModule,
    UserPaymentAdminModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IpMiddleware)
      .forRoutes('*'); // Áp dụng cho tất cả routes
  }
}
import { Module } from '@nestjs/common';
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
import { HomeAdminModule } from './modules/home/admin/home.module';
import { HomeAppModule } from './modules/home/app/home.module';
import { HomeSubmitAppModule } from './modules/homeSubmit/app/homeSubmit.module';
import { HomeSubmitAdminModule } from './modules/homeSubmit/admin/homeSubmit.module';
import { BlogAdminModule } from './modules/blog/admin/blog.module';
import { CodeModule } from './modules/code/code.module';
import { DoctorAppModule } from './modules/doctor/app/doctor.module';
import { DoctorAdminModule } from './modules/doctor/admin/doctor.module';
import { LoggerModule } from './common/logger/logger.module';
import { AuthAppModule } from './modules/auth/app/auth.module';
import { OtpAppModule } from './modules/otp/otp.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UserAppModule } from './modules/user/app/user.module';
import { UserPaymentModule } from './modules/userPayment/user.module';
import { UserAdminModule } from './modules/user/admin/user.module';
import { ContentAppModule } from './modules/content/app/content.module';
import { InfoAppModule } from './modules/info/app/info.module';
import { CategoryAdminModule } from './modules/category/admin/category.module';

@Module({
  imports: [
    // global
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    LoggerModule,
    CodeModule,

    //app
    AuthAppModule,
    OtpAppModule,
    UserAppModule,
    UserPaymentModule,
    QuestionAppModule,
    AnswerAppModule,
    DoctorAppModule,
    HomeAppModule,
    HomeSubmitAppModule,
    ContentAppModule,
    InfoAppModule,

    //admin
    AuthAdminModule,
    UserAdminModule,
    CategoryAdminModule,
    QuestionAdminModule,
    AnswerAdminModule,
    UploadAdminModule,
    HomeAdminModule,
    HomeSubmitAdminModule,
    BlogAdminModule,
    DoctorAdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

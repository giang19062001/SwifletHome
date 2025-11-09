import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { QuestionAdminModule } from './modules/question/admin/question.module';
import { AnswerAdminModule } from './modules/answer/admin/answer.module';
import { UploadModule } from './modules/upload/upload.module';
import { AuthModule } from './modules/auth/admin/auth.module';
import { CategoryModule } from './modules/category/category.module';
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
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // all module
    }),
    DatabaseModule, // global
    LoggerModule, // global
    AuthModule,
    CategoryModule,
    CodeModule,
    QuestionAdminModule,
    QuestionAppModule,
    AnswerAdminModule,
    AnswerAppModule,
    UploadModule,
    HomeAdminModule,
    HomeAppModule,
    HomeSubmitAppModule,
    HomeSubmitAdminModule,
    BlogAdminModule,
    DoctorAppModule,
    DoctorAdminModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

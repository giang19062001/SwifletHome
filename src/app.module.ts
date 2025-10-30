import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { QuestionAdminModule } from './modules/question/admin/question.module';
import { AnswerAdminModule } from './modules/answer/admin/answer.module';
import { UploadModule } from './modules/upload/upload.module';
import { AuthModule } from './modules/auth/admin/auth.module';
import { CateQuestionModule } from './modules/cateQuestion/cateQuestion.module';
import { AnswerAppModule } from './modules/answer/app/answer.module';
import { QuestionAppModule } from './modules/question/app/question.module';
import { HomeAdminModule } from './modules/home/admin/home.module';
import { HomeAppModule } from './modules/home/app/home.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // all module
    }),
    DatabaseModule,
    AuthModule,
    CateQuestionModule,
    QuestionAdminModule,
    QuestionAppModule,
    AnswerAdminModule,
    AnswerAppModule,
    UploadModule,
    HomeAdminModule,
    HomeAppModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { QuestionAdminModule } from './question/admin/question.module';
import { AnswerAdminModule } from './answer/admin/answer.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/admin/auth.module';
import { CateQuestionModule } from './cateQuestion/cateQuestion.module';
import { AnswerAppModule } from './answer/app/answer.module';
import { QuestionAppModule } from './question/app/question.module';

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
    UploadModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

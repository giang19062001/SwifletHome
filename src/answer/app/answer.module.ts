import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { AuthModule } from 'src/auth/admin/auth.module';
import { AnswerAppService } from './answer.service';
import { AnswerAppController } from './answer.controller';
import { AnswerAppRepository } from './answer.repository';
import { QuestionAppModule } from 'src/question/app/question.module';
import { SearchModule } from 'src/search/search.module';
@Module({
  imports: [DatabaseModule, AuthModule, QuestionAppModule, SearchModule],
  controllers: [AnswerAppController],
  providers: [AnswerAppService, AnswerAppRepository],
})
export class AnswerAppModule {}

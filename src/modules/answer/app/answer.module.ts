import { Module } from '@nestjs/common';
import { AnswerAppService } from './answer.service';
import { AnswerAppController } from './answer.controller';
import { AnswerAppRepository } from './answer.repository';
import { QuestionAppModule } from 'src/modules/question/app/question.module';
import { SearchModule } from 'src/common/search/search.module';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
@Module({
  imports: [AuthAppModule, QuestionAppModule, SearchModule],
  controllers: [AnswerAppController],
  providers: [AnswerAppService, AnswerAppRepository],
})
export class AnswerAppModule {}

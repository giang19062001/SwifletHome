import { Module } from '@nestjs/common';
import { AnswerAppService } from './answer.service';
import { AnswerAppController } from './answer.controller';
import { AnswerAppRepository } from './answer.repository';
import { QuestionAppModule } from 'src/modules/question/app/question.module';
import { SearchModule } from 'src/modules/search/search.module';
@Module({
  imports: [QuestionAppModule, SearchModule],
  controllers: [AnswerAppController],
  providers: [AnswerAppService, AnswerAppRepository],
})
export class AnswerAppModule {}

import { Module } from '@nestjs/common';
import { QuestionAppService } from './question.service';
import { QuestionAppRepository } from './question.repository';

@Module({
  imports: [],
  providers: [QuestionAppService, QuestionAppRepository],
  exports:[QuestionAppService]
})
export class QuestionAppModule {}

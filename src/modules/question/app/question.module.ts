import { Module } from '@nestjs/common';
import { QuestionAppRepository } from './question.repository';
import { QuestionAppService } from './question.service';

@Module({
  imports: [],
  providers: [QuestionAppService, QuestionAppRepository],
  exports:[QuestionAppService]
})
export class QuestionAppModule {}

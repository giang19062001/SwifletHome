import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { QuestionAppService } from './question.service';
import { QuestionAppRepository } from './question.repository';

@Module({
  imports: [DatabaseModule],
  providers: [QuestionAppService, QuestionAppRepository],
  exports:[QuestionAppService]
})
export class QuestionAppModule {}

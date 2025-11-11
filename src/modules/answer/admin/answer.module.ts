import { Module } from '@nestjs/common';
import { AnswerAdminController } from './answer.controller';
import { AnswerAdminService } from './answer.service';
import { AnswerAdminRepository } from './answer.repository';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { QuestionAdminModule } from 'src/modules/question/admin/question.module';
@Module({
  imports: [AuthAdminModule, QuestionAdminModule],
  controllers: [AnswerAdminController],
  providers: [AnswerAdminService, AnswerAdminRepository],
  exports:[AnswerAdminService]
})
export class AnswerAdminModule {}

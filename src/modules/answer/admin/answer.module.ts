import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { QuestionAdminModule } from 'src/modules/question/admin/question.module';
import { AnswerAdminController } from './answer.controller';
import { AnswerAdminRepository } from './answer.repository';
import { AnswerAdminService } from './answer.service';
@Module({
  imports: [AuthAdminModule, QuestionAdminModule],
  controllers: [AnswerAdminController],
  providers: [AnswerAdminService, AnswerAdminRepository],
  exports:[AnswerAdminService]
})
export class AnswerAdminModule {}

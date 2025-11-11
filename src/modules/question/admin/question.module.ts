import { Module } from '@nestjs/common';
import { QuestionAdminController } from './question.controller';
import { QuestionAdminService } from './question.service';
import { QuestionAdminRepository } from './question.repository';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
@Module({
  imports: [AuthAdminModule],
  controllers: [QuestionAdminController],
  providers: [QuestionAdminService, QuestionAdminRepository],
  exports:[QuestionAdminService]
})
export class QuestionAdminModule {}

import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { QuestionAdminController } from './question.controller';
import { QuestionAdminRepository } from './question.repository';
import { QuestionAdminService } from './question.service';
@Module({
  imports: [AuthAdminModule],
  controllers: [QuestionAdminController],
  providers: [QuestionAdminService, QuestionAdminRepository],
  exports:[QuestionAdminService]
})
export class QuestionAdminModule {}

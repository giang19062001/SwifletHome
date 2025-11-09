import { Module } from '@nestjs/common';
import { QuestionAdminController } from './question.controller';
import { QuestionAdminService } from './question.service';
import { QuestionAdminRepository } from './question.repository';
import { AuthModule } from 'src/modules/auth/admin/auth.module';
@Module({
  imports: [AuthModule],
  controllers: [QuestionAdminController],
  providers: [QuestionAdminService, QuestionAdminRepository],
  exports:[QuestionAdminService]
})
export class QuestionAdminModule {}

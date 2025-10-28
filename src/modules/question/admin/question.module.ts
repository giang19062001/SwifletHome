import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { QuestionAdminController } from './question.controller';
import { QuestionAdminService } from './question.service';
import { QuestionAdminRepository } from './question.repository';
import { AuthModule } from 'src/modules/auth/admin/auth.module';
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [QuestionAdminController],
  providers: [QuestionAdminService, QuestionAdminRepository],
  exports:[QuestionAdminService]
})
export class QuestionAdminModule {}

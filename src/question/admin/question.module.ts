import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { QuestionRepository } from './question.repository';
import { AuthModule } from 'src/auth/admin/auth.module';
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [QuestionController],
  providers: [QuestionService, QuestionRepository],
})
export class QuestionAdminModule {}

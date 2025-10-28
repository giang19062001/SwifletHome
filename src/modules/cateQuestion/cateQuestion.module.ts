import { Module } from '@nestjs/common';
import { CateQuestionService } from './cateQuestion.service';
import { CateQuestionRepository } from './cateQuestion.repository';
import { CateQuestionController } from './cateQuestion.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/modules/auth/admin/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CateQuestionController],
  providers: [CateQuestionService, CateQuestionRepository],
  exports:[CateQuestionService]
})
export class CateQuestionModule {}

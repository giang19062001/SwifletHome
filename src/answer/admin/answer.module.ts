import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { AnswerAdminController } from './answer.controller';
import { AnswerAdminService } from './answer.service';
import { AnswerAdminRepository } from './answer.repository';
import { AuthModule } from 'src/auth/admin/auth.module';
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AnswerAdminController],
  providers: [AnswerAdminService, AnswerAdminRepository],
  exports:[AnswerAdminService]
})
export class AnswerAdminModule {}

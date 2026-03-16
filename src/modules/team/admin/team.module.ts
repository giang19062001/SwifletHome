import { Module } from '@nestjs/common';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { TeamAdminController } from './team.controller';
import { TeamAdminRepository } from './team.repository';
import { TeamAdminService } from './team.service';

@Module({
  imports: [AuthAdminModule, FileLocalModule],
  controllers: [TeamAdminController],
  providers: [TeamAdminService, TeamAdminRepository],
  exports:[TeamAdminService]
})
export class TeamAdminModule {}

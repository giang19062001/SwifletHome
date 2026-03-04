import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { TeamAdminController } from './team.controller';
import { TeamAdminService } from './team.service';
import { TeamAdminRepository } from './team.repository';

@Module({
  imports: [AuthAdminModule, FileLocalModule],
  controllers: [TeamAdminController],
  providers: [TeamAdminService, TeamAdminRepository],
  exports:[TeamAdminService]
})
export class TeamAdminModule {}

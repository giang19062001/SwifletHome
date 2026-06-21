import { Module } from '@nestjs/common';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { FirebaseModule } from 'src/common/firebase/firebase.module';
import { TeamAdminController } from './team.controller';
import { TeamAdminRepository } from './team.repository';
import { TeamAdminService } from './team.service';

@Module({
  imports: [AuthAdminModule, FileLocalModule, FirebaseModule],
  controllers: [TeamAdminController],
  providers: [TeamAdminService, TeamAdminRepository],
  exports: [TeamAdminService],
})
export class TeamAdminModule {}

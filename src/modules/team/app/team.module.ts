import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { TeamAppController } from './team.controller';
import { TeamAppService } from './team.service';
import { TeamAppRepository } from './team.repository';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';

@Module({
  imports: [AuthAppModule, UserAppModule, FileLocalModule],
  controllers: [TeamAppController],
  providers: [TeamAppService, TeamAppRepository],
  exports: [TeamAppRepository],
})
export class TeamAppModule {}

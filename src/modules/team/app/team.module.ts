import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { TeamAppController } from './team.controller';
import { TeamAppService } from './team.service';
import { TeamAppRepository } from './team.repository';

@Module({
  imports: [AuthAppModule, UserAppModule],
  controllers: [TeamAppController],
  providers: [TeamAppService, TeamAppRepository],
  exports: [],
})
export class TeamAppModule {}

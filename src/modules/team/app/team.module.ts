import { Module } from '@nestjs/common';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { OptionModule } from 'src/modules/options/option.module';
import { ProvinceModule } from 'src/modules/province/app/province.module';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { TeamReviewAppRepository } from './team-review.repository';
import { TeamReviewAppService } from './team-review.service';
import { TeamUserAppRepository } from './team-user.repository';
import { TeamUserAppService } from './team-user.service';
import { TeamAppController } from './team.controller';

@Module({
  imports: [AuthAppModule, UserAppModule, FileLocalModule, ProvinceModule, OptionModule],
  controllers: [TeamAppController],
  providers: [TeamUserAppService, TeamReviewAppService, TeamUserAppRepository, TeamReviewAppRepository],
  exports: [TeamReviewAppService, TeamUserAppService],
})
export class TeamAppModule {}

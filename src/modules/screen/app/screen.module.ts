import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { InfoAppModule } from 'src/modules/info/app/info.module';
import { PackageAppModule } from 'src/modules/package/app/package.module';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { ScreenAppController } from './screen.controller';
import { ScreenAppRepository } from './screen.repository';
import { ScreenAppService } from './screen.service';


@Module({
  imports: [AuthAppModule, PackageAppModule, InfoAppModule, UserAppModule],
  controllers: [ScreenAppController],
  providers: [ScreenAppService, ScreenAppRepository],
  exports: []
})
export class ScreenAppModule {}
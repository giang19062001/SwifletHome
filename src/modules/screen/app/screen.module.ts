import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { InfoAppModule } from 'src/modules/info/app/info.module';
import { PackageAppModule } from 'src/modules/package/app/package.module';
import { ScreenAppRepository } from './screen.repository';
import { ScreenAppController } from './screen.controller';
import { ScreenAppService } from './screen.service';
import { UserAppModule } from 'src/modules/user/app/user.module';


@Module({
  imports: [AuthAppModule, PackageAppModule, InfoAppModule, UserAppModule],
  controllers: [ScreenAppController],
  providers: [ScreenAppService, ScreenAppRepository],
  exports: []
})
export class ScreenAppModule {}
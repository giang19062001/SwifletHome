import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { InfoAppModule } from 'src/modules/info/app/info.module';
import { PackageAppModule } from 'src/modules/package/app/package.module';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { ScreenAppController } from './screen.controller';
import { ScreenAppRepository } from './screen.repository';
import { ScreenAppService } from './screen.service';
import { CommonGuideStrategy } from './strategies/common-guide.strategy';
import { RequestDoctorStrategy } from './strategies/request-doctor.strategy';
import { SignupServiceStrategy } from './strategies/signup-service.strategy';


@Module({
  imports: [AuthAppModule, PackageAppModule, InfoAppModule, UserAppModule],
  controllers: [ScreenAppController],
  providers: [
    ScreenAppService,
    ScreenAppRepository,
    SignupServiceStrategy,
    RequestDoctorStrategy,
    CommonGuideStrategy,
    {
      provide: 'SCREEN_STRATEGIES',
      useFactory: (...strategies: any[]) => strategies,
      inject: [SignupServiceStrategy, RequestDoctorStrategy, CommonGuideStrategy], // gom các chiến lược thành 1 nhà máy chung có cùng interface
    },
  ],
  exports: []
})
export class ScreenAppModule {}
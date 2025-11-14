import { Module } from '@nestjs/common';
import { HomeSubmitAppRepository } from './homeSubmit.repository';
import { HomeSubmitAppService } from './homeSubmit.service';
import { HomeSubmitAppController } from './homeSubmit.controller';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { HomeAppModule } from 'src/modules/home/app/home.module';

@Module({
  imports: [AuthAppModule,UserAppModule, HomeAppModule],
  controllers: [HomeSubmitAppController],
  providers: [HomeSubmitAppService, HomeSubmitAppRepository],
})
export class HomeSubmitAppModule {}

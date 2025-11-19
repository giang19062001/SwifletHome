import { Module } from '@nestjs/common';
import { HomeSubmitAppRepository } from './homeSubmit.repository';
import { HomeSubmitAppService } from './homeSubmit.service';
import { HomeSubmitAppController } from './homeSubmit.controller';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { HomeSaleAppModule } from 'src/modules/homeSale/app/homeSale.module';

@Module({
  imports: [AuthAppModule, HomeSaleAppModule],
  controllers: [HomeSubmitAppController],
  providers: [HomeSubmitAppService, HomeSubmitAppRepository],
})
export class HomeSubmitAppModule {}

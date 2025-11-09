import { Module } from '@nestjs/common';
import { HomeSubmitAppRepository } from './homeSubmit.repository';
import { HomeSubmitAppService } from './homeSubmit.service';
import { HomeSubmitAppController } from './homeSubmit.controller';

@Module({
  imports: [],
  controllers: [HomeSubmitAppController],
  providers: [HomeSubmitAppService, HomeSubmitAppRepository],
})
export class HomeSubmitAppModule {}

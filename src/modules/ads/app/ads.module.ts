import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { AdsAppController } from './ads.controller';
import { AdsAppRepository } from './ads.repository';
import { AdsAppService } from './ads.service';

@Module({
  imports: [AuthAppModule],
  controllers: [AdsAppController],
  providers: [AdsAppService, AdsAppRepository],
})
export class AdsAppModule {}

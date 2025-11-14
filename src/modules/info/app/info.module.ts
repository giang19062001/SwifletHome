import { Module } from '@nestjs/common';
import { InfoAppService } from './info.service';
import { InfoAppRepository } from './info.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [InfoAppService, InfoAppRepository],
  exports: [InfoAppService]
})
export class InfoAppModule {}
import { Module } from '@nestjs/common';
import { InfoAppService } from './info.service';
import { InfoAppRepository } from './info.repository';
import { InfoAppController } from './info.controller';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';

@Module({
  imports: [AuthAppModule],
  controllers: [InfoAppController],
  providers: [InfoAppService, InfoAppRepository],
  exports: [InfoAppService]
})
export class InfoAppModule {}
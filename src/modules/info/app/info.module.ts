import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { InfoAppController } from './info.controller';
import { InfoAppRepository } from './info.repository';
import { InfoAppService } from './info.service';

@Module({
  imports: [AuthAppModule],
  controllers: [InfoAppController],
  providers: [InfoAppService, InfoAppRepository],
  exports: [InfoAppService]
})
export class InfoAppModule {}
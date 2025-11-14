import { Module } from '@nestjs/common';
import { ContentAppService } from './content.service';
import { ContentAppRepository } from './content.repository';
import { ContentAppController } from './content.controller';
import { PackageAppModule } from 'src/modules/package/app/package.module';
import { InfoAppModule } from 'src/modules/info/app/info.module';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';

@Module({
  imports: [AuthAppModule, PackageAppModule, InfoAppModule],
  controllers: [ContentAppController],
  providers: [ContentAppService, ContentAppRepository],
  exports: []
})
export class ContentAppModule {}
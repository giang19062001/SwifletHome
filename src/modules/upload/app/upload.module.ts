import { Module } from '@nestjs/common';
import { UploadAppService } from './upload.service';
import { UploadAppRepository } from './upload.repository';
import { UploadAppController } from './upload.controller';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';

@Module({
  imports: [AuthAppModule],
  controllers:[UploadAppController],
  providers: [UploadAppService, UploadAppRepository],
  exports: [UploadAppService],
})
export class UploadAppModule {}

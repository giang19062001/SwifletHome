import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { UploadAppController } from './upload.controller';
import { UploadAppRepository } from './upload.repository';
import { UploadAppService } from './upload.service';

@Module({
  imports: [AuthAppModule],
  controllers:[UploadAppController],
  providers: [UploadAppService, UploadAppRepository],
  exports: [UploadAppService],
})
export class UploadAppModule {}

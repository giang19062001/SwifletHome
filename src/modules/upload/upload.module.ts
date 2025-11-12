import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { UploadRepository } from './upload.repository';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';

@Module({
  imports: [AuthAdminModule],
  controllers: [UploadController],
  providers: [UploadService, UploadRepository],
  exports: [UploadService],
})
export class UploadAdminModule {}

import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { UploadRepository } from './upload.repository';
import { AuthModule } from 'src/modules/auth/admin/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UploadController],
  providers: [UploadService, UploadRepository],
  exports: [UploadService],
})
export class UploadModule {}

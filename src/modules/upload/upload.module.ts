import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { UploadRepository } from './upload.repository';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';

@Module({
  imports: [AuthAdminModule, FileLocalModule],
  controllers: [UploadController],
  providers: [UploadService, UploadRepository],
  exports: [UploadService],
})
export class UploadAdminModule {}

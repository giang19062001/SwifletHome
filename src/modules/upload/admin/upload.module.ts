import { Module } from '@nestjs/common';
import { UploadAdminService } from './upload.service';
import { UploadAdminController } from './upload.controller';
import { UploadAdminRepository } from './upload.repository';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';

@Module({
  imports: [AuthAdminModule, FileLocalModule],
  controllers: [UploadAdminController],
  providers: [UploadAdminService, UploadAdminRepository],
  exports: [UploadAdminService],
})
export class UploadAdminModule {}

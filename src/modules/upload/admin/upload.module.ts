import { Module } from '@nestjs/common';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { UploadAdminController } from './upload.controller';
import { UploadAdminRepository } from './upload.repository';
import { UploadAdminService } from './upload.service';

@Module({
  imports: [AuthAdminModule, FileLocalModule],
  controllers: [UploadAdminController],
  providers: [UploadAdminService, UploadAdminRepository],
  exports: [UploadAdminService],
})
export class UploadAdminModule {}

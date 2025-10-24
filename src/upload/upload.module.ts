import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { UploadRepository } from './upload.repository';
import { DatabaseModule } from 'src/common/database/database.module';
import { AuthModule } from 'src/auth/admin/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UploadController],
  providers: [UploadService, UploadRepository],
  exports: [UploadService],
})
export class UploadModule {}

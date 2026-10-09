import { Module } from '@nestjs/common';
import { MinioModule } from '../minio/minio.module';
import { FileLocalService } from './fileLocal.service';

@Module({
  imports: [MinioModule],
  providers: [FileLocalService],
  exports: [FileLocalService],
})
export class FileLocalModule {}

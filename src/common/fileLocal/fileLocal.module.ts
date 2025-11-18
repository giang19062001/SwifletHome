import { Module } from '@nestjs/common';
import { FileLocalService } from './fileLocal.service';

@Module({
  providers: [FileLocalService],
  exports: [FileLocalService],
})
export class FileLocalModule {}

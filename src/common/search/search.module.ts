import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { UploadAdminModule } from 'src/modules/upload/upload.module';

@Module({
  imports:[UploadAdminModule],
  providers: [SearchService],
  exports:[SearchService]
})
export class SearchModule {}

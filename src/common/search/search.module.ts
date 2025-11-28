import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { UploadAdminModule } from 'src/modules/upload/upload.module';
import { UserAppModule } from 'src/modules/user/app/user.module';

@Module({
  imports:[UploadAdminModule, UserAppModule],
  providers: [SearchService],
  exports:[SearchService]
})
export class SearchModule {}

import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { UploadAppModule } from 'src/modules/upload/app/upload.module';

@Module({
  imports:[UploadAppModule, UserAppModule],
  providers: [SearchService],
  exports:[SearchService]
})
export class SearchModule {}

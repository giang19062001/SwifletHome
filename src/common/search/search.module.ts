import { Module } from '@nestjs/common';
import { UploadAppModule } from 'src/modules/upload/app/upload.module';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { SearchService } from './search.service';

@Module({
  imports:[UploadAppModule, UserAppModule],
  providers: [SearchService],
  exports:[SearchService]
})
export class SearchModule {}

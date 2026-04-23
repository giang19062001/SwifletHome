import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { BlacklistService } from './blacklist.service';
import { BlacklistGuard } from './blacklist.guard';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [BlacklistService, BlacklistGuard],
  exports: [BlacklistService, BlacklistGuard],
})
export class BlacklistModule {}

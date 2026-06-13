import { Module } from '@nestjs/common';
import { ShareAppRepository } from './share.repository';
import { ShareAppService } from './share.service';
import ShareAppController from './share.controller';
import { TodoAppModule } from 'src/modules/todo/app/todo.module';
import { UserHomeAppModule } from 'src/modules/userHome/app/userHome.module';

@Module({
  imports: [TodoAppModule, UserHomeAppModule],
  controllers: [ShareAppController],
  providers: [ShareAppService, ShareAppRepository],
  exports: [ShareAppService],
})
export class ShareAppModule {}

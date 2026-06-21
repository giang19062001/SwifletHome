import { Module } from '@nestjs/common';
import { ChatModule } from 'src/common/chat/chat.module';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { BlogAppController } from './blog.controller';
import { BlogAdppRepository } from './blog.repository';
import { BlogAppService } from './blog.service';

@Module({
  imports: [AuthAppModule, ChatModule],
  controllers: [BlogAppController],
  providers: [BlogAppService, BlogAdppRepository],
  exports: [BlogAppService],
})
export class BlogAppModule {}

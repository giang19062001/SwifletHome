import { Module } from '@nestjs/common';
import { UploadAppModule } from 'src/modules/upload/app/upload.module';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { ChatService } from './chat.service';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports:[UploadAppModule, UserAppModule, LlmModule],
  providers: [ChatService],
  exports:[ChatService]
})
export class ChatModule {}

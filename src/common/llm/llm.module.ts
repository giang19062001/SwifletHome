import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}

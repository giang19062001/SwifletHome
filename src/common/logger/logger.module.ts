import { Global, Module } from '@nestjs/common';
import { LoggingService } from './logger.service';

@Global()
@Module({
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggerModule {}

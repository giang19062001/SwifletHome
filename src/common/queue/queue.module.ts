import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { VideoConverterInterceptor } from 'src/interceptors/video-converter.interceptor';
import { NotificationQueueService, VideoQueueService } from './queue.service';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: 'notification' }, { name: 'video' })],
  providers: [NotificationQueueService, VideoQueueService, VideoConverterInterceptor],
  exports: [BullModule, VideoConverterInterceptor],
})
export class QueueModule {}

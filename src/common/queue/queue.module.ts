import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { VideoConverterInterceptor } from 'src/interceptors/video-converter.interceptor';
import { NotificationQueueService, PdfQueueService, VideoQueueService } from './queue.service';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: 'notification' }, { name: 'video' }, { name: 'pdf' })],
  providers: [NotificationQueueService, VideoQueueService, PdfQueueService, VideoConverterInterceptor],
  exports: [BullModule, PdfQueueService, VideoConverterInterceptor],
})
export class QueueModule {}

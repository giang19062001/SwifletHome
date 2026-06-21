import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationAppModule } from 'src/modules/notification/app/notification.module';
import { FirebaseService } from './firebase.service';
import { QueueService } from '../queue/queue.service';

@Global()
@Module({
  imports: [
    NotificationAppModule,
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  providers: [FirebaseService, QueueService],
  exports: [FirebaseService],
})
export class FirebaseModule {}

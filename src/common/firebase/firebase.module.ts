import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { NotificationAppModule } from 'src/modules/notification/notification.module';

@Module({
  imports:[NotificationAppModule],
  providers: [FirebaseService],
  exports: [FirebaseService]
})
export class FirebaseModule {}
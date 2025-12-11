import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { NotificationAppModule } from 'src/modules/notification/app/notification.module';

@Global()
@Module({
  imports:[NotificationAppModule],
  providers: [FirebaseService],
  exports: [FirebaseService]
})
export class FirebaseModule {}
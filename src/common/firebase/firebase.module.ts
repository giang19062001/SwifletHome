import { Global, Module } from '@nestjs/common';
import { NotificationAppModule } from 'src/modules/notification/app/notification.module';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  imports:[NotificationAppModule],
  providers: [FirebaseService],
  exports: [FirebaseService]
})
export class FirebaseModule {}
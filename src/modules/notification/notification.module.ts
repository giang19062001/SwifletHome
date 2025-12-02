import { Module } from '@nestjs/common';
import { NotificationAppService } from './notification.service';
import { NotificationAppRepository } from './notification.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [NotificationAppService, NotificationAppRepository],
  exports: [NotificationAppService, NotificationAppRepository]
})
export class NotificationAppModule {}
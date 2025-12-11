import { Module } from '@nestjs/common';
import { NotificationAppService } from './notification.service';
import { NotificationAppRepository } from './notification.repository';
import { NotificationAppController } from './notification.controller';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';

@Module({
  imports: [AuthAppModule],
  controllers: [NotificationAppController],
  providers: [NotificationAppService, NotificationAppRepository],
  exports: [NotificationAppService, NotificationAppRepository]
})
export class NotificationAppModule {} 
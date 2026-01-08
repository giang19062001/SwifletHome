import { Module } from '@nestjs/common';
import { NotificationAppService } from './notification.service';
import { NotificationAppRepository } from './notification.repository';
import { NotificationAppController } from './notification.controller';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { UserAppModule } from 'src/modules/user/app/user.module';

@Module({
  imports: [AuthAppModule, UserAppModule],
  controllers: [NotificationAppController],
  providers: [NotificationAppService, NotificationAppRepository],
  exports: [NotificationAppService, NotificationAppRepository]
})
export class NotificationAppModule {} 
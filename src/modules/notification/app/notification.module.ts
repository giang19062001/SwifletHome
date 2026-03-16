import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { NotificationAppController } from './notification.controller';
import { NotificationAppRepository } from './notification.repository';
import { NotificationAppService } from './notification.service';

@Module({
  imports: [AuthAppModule, UserAppModule],
  controllers: [NotificationAppController],
  providers: [NotificationAppService, NotificationAppRepository],
  exports: [NotificationAppService]
})
export class NotificationAppModule {} 
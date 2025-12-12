import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { NotificationAdminService } from './notification.service';
import { NotificationAdminController } from './notification.controller';
import { NotificationAdminRepository } from './notification.repository';

@Module({
  imports: [AuthAdminModule],
  controllers: [NotificationAdminController],
  providers: [NotificationAdminService, NotificationAdminRepository],
  exports: [],
})
export class NotificationAdminModule {}

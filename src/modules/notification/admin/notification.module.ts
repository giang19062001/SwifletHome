import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { NotificationAdminService } from './notification.service';
import { NotificationAdminController } from './notification.controller';
import { NotificationAdminRepository } from './notification.repository';
import { UserAdminModule } from 'src/modules/user/admin/user.module';

@Module({
  imports: [AuthAdminModule, UserAdminModule],
  controllers: [NotificationAdminController],
  providers: [NotificationAdminService, NotificationAdminRepository],
  exports: [],
})
export class NotificationAdminModule {}

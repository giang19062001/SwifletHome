import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { UserAdminModule } from 'src/modules/user/admin/user.module';
import { UserHomeAdminModule } from 'src/modules/userHome/admin/userHome.module';
import { NotificationAdminController } from './notification.controller';
import { NotificationAdminRepository } from './notification.repository';
import { NotificationAdminService } from './notification.service';

@Module({
  imports: [AuthAdminModule, UserAdminModule, UserHomeAdminModule],
  controllers: [NotificationAdminController],
  providers: [NotificationAdminService, NotificationAdminRepository],
  exports: [NotificationAdminService],
})
export class NotificationAdminModule {}

import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { ConsignmentAdminService } from './consignment.service';
import { ConsignmentAdminController } from './consignment.controller';
import { ConsignmentAdminRepository } from './consignment.repository';
import { NotificationAdminModule } from 'src/modules/notification/admin/notification.module';
import { UserAdminModule } from 'src/modules/user/admin/user.module';

@Module({
  imports: [AuthAdminModule, FileLocalModule, NotificationAdminModule, UserAdminModule],
  controllers: [ConsignmentAdminController],
  providers: [ConsignmentAdminService, ConsignmentAdminRepository],
  exports: [],
})
export class ConsignmentAdminModule {}

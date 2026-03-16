import { Module } from '@nestjs/common';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { NotificationAdminModule } from 'src/modules/notification/admin/notification.module';
import { UserAdminModule } from 'src/modules/user/admin/user.module';
import { ConsignmentAdminController } from './consignment.controller';
import { ConsignmentAdminRepository } from './consignment.repository';
import { ConsignmentAdminService } from './consignment.service';

@Module({
  imports: [AuthAdminModule, FileLocalModule, NotificationAdminModule, UserAdminModule],
  controllers: [ConsignmentAdminController],
  providers: [ConsignmentAdminService, ConsignmentAdminRepository],
  exports: [],
})
export class ConsignmentAdminModule {}

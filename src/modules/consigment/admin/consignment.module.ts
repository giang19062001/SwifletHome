import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { ConsignmentAdminService } from './consignment.service';
import { ConsignmentAdminController } from './consignment.controller';
import { ConsignmentAdminRepository } from './consignment.repository';

@Module({
  imports: [AuthAdminModule, FileLocalModule],
  controllers: [ConsignmentAdminController],
  providers: [ConsignmentAdminService, ConsignmentAdminRepository],
  exports:[]
})
export class ConsignmentAdminModule {}

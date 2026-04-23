import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { ReportAdminController } from './report.controller';
import { ReportAdminService } from './report.service';
import { ReportAdminRepository } from './report.repository';

@Module({
  imports: [DatabaseModule, AuthAdminModule],
  controllers: [ReportAdminController],
  providers: [ReportAdminService, ReportAdminRepository],
})
export class ReportAdminModule {}

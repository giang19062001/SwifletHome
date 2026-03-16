import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { UserHomeAppModule } from 'src/modules/userHome/app/userHome.module';
import ReportAppController from './report.controller';
import { ReportAppRepository } from './report.repository';
import { ReportAppService } from './report.service';


@Module({
  imports: [AuthAppModule, UserHomeAppModule],
  controllers: [ReportAppController],
  providers: [ReportAppService, ReportAppRepository],
  exports: []
})
export class ReportAppModule {}
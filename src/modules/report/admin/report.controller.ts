import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { ReportAdminService } from './report.service';
import { ReportOverviewResDto } from './report.dto';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/report')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/report')
export class ReportAdminController {
  constructor(private readonly reportAdminService: ReportAdminService) {}

  @Get('getOverview')
  @HttpCode(HttpStatus.OK)
  async getOverview(): Promise<ReportOverviewResDto> {
    return this.reportAdminService.getOverview();
  }
}

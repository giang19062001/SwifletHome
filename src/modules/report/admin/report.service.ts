import { Injectable } from '@nestjs/common';
import { ReportAdminRepository } from './report.repository';
import { ReportOverviewResDto } from './report.dto';

@Injectable()
export class ReportAdminService {
  constructor(private readonly reportAdminRepository: ReportAdminRepository) {}

  async getOverview(): Promise<ReportOverviewResDto> {
    return this.reportAdminRepository.getOverview();
  }
}

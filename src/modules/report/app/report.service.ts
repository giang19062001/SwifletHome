import { Injectable } from '@nestjs/common';
import { GetHarvertReportDto, ReportTypeEnum } from './report.dto';
import { ReportAppRepository } from './report.repository';
import { GetHarvertReportDetailResDto, GetHarvertReportSummaryResDto } from './report.response';

@Injectable()
export class ReportAppService {
  private readonly SERVICE_NAME = 'ReportAppService';

  constructor(private readonly reportAppRepository: ReportAppRepository) {}

  async getHarvertReport(dto: GetHarvertReportDto, userCode: string): Promise<GetHarvertReportSummaryResDto | GetHarvertReportDetailResDto[]> {
    const logbase = `${this.SERVICE_NAME}/getHarvertReportSummary:`;
    if (dto.reportType === ReportTypeEnum.SUMMARY) {
      const result = await this.reportAppRepository.getHarvertReportSummary(dto, userCode);
      return result;
    } else {
      const result = await this.reportAppRepository.getHarvertReportDetail(dto, userCode);
      return result;
    }
  }
}

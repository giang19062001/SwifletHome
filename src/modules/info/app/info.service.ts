import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { InfoResDto } from '../info.response';
import { InfoAppRepository } from './info.repository';

@Injectable()
export class InfoAppService {
  private readonly SERVICE_NAME = 'InfoAppService';

  constructor(
    private readonly infoAppRepository: InfoAppRepository,
    private readonly logger: LoggingService,
  ) {}

  async getDetail(infoKeyword: string): Promise<InfoResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getDetail:`;
    const result = await this.infoAppRepository.getDetail(infoKeyword);
    if (result && result.infoContent && typeof result.infoContent === 'object' && 'vat' in result.infoContent) {
      result.infoContent.vat = Number(result.infoContent.vat);
    }
    return result;
  }
}

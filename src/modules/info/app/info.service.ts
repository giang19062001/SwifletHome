import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { InfoAppRepository } from './info.repository';
import { InfoResDto } from "../info.response";

@Injectable()
export class InfoAppService {
  private readonly SERVICE_NAME = 'InfoAppService';

  constructor(
    private readonly infoAppRepository: InfoAppRepository,
    private readonly logger: LoggingService,
  ) {}

  async getDetail(infoKeyword: string): Promise<InfoResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getDetail:`;
    this.logger.log(logbase, `infoKeyword(${infoKeyword})`);
    const result = await this.infoAppRepository.getDetail(infoKeyword);
    return result;
  }
}

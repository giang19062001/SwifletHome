import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Msg } from 'src/helpers/message';
import { LoggingService } from 'src/common/logger/logger.service';
import { PackageAppService } from 'src/modules/package/app/package.service';
import { InfoAppRepository } from './info.repository';
import { IInfo } from '../info.interface';

@Injectable()
export class InfoAppService {
  private readonly SERVICE_NAME = 'InfoAppService';

  constructor(
    private readonly infoAppRepository: InfoAppRepository,
    private readonly logger: LoggingService,
  ) {}

  async getDetail(infoCharacter: string): Promise<IInfo | null> {
    const result = await this.infoAppRepository.getDetail(infoCharacter);
    return result;
  }
}

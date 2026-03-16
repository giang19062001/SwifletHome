import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { formatPrice } from 'src/helpers/func.helper';
import { PackageResDto } from "../package.response";
import { PackageAppRepository } from './package.repository';

@Injectable()
export class PackageAppService {
  private readonly SERVICE_NAME = 'PackageService';

  constructor(
    private readonly packageAppRepository: PackageAppRepository,
    private readonly logger: LoggingService,
  ) {}

  async getOne(): Promise<PackageResDto> {
    const result = await this.packageAppRepository.getOne();

    return {
      ...result,
      packagePrice: formatPrice(result.packagePrice), // chuyên sang tiền việt};
    };
  }
}

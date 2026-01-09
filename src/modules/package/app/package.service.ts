import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Msg } from 'src/helpers/message.helper';
import { LoggingService } from 'src/common/logger/logger.service';
import { PackageAppRepository } from './package.repository';
import { PagingDto } from 'src/dto/admin.dto';
import { IPackage } from '../package.interface';
import { formatPrice } from 'src/helpers/func.helper';

@Injectable()
export class PackageAppService {
  private readonly SERVICE_NAME = 'PackageService';

  constructor(
    private readonly packageAppRepository: PackageAppRepository,
    private readonly logger: LoggingService,
  ) {}

  async getOne(): Promise<IPackage> {
    const result = await this.packageAppRepository.getOne();

    return {
      ...result,
      packagePrice: formatPrice(result.packagePrice), // chuyên sang tiền việt};
    };
  }
}

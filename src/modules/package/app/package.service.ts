import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Msg } from 'src/helpers/message';
import { LoggingService } from 'src/common/logger/logger.service';
import { PackageAppRepository } from './package.repository';
import { PagingDto } from 'src/dto/common';
import { IPackage } from '../package.interface';

@Injectable()
export class PackageAppService {
  private readonly SERVICE_NAME = 'PackageService';

  constructor(
    private readonly packageAppRepository: PackageAppRepository,
    private readonly logger: LoggingService,
  ) {}

  async getAll(dto: PagingDto): Promise<IPackage[]> {
    return await this.packageAppRepository.getAll(dto);
  }
}

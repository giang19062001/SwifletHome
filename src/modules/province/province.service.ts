import { Injectable } from '@nestjs/common';
import { ProvinceRepository } from './province.repository';
import { IProvince } from './province.interface';
import { LoggingService } from 'src/common/logger/logger.service';

@Injectable()
export class ProvinceService {
  private readonly SERVICE_NAME = 'ProvinceService';

  constructor(
    private readonly provinceRepository: ProvinceRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(): Promise<IProvince[]> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;

    const list = await this.provinceRepository.getAll();
    this.logger.log(logbase, `list.length(${list.length})`);

    return list;
  }
}

import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { ProvinceRepository } from './province.repository';
import { ProvinceResDto } from "./province.response";

@Injectable()
export class ProvinceService {
  private readonly SERVICE_NAME = 'ProvinceService';

  constructor(
    private readonly provinceRepository: ProvinceRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(): Promise<ProvinceResDto[]> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;

    const list = await this.provinceRepository.getAll();
    this.logger.log(logbase, `list.length(${list.length})`);

    return list;
  }
}

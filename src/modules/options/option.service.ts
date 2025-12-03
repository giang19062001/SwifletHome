import { Injectable } from '@nestjs/common';
import { OptionRepository } from './option.repository';
import { GetOptionDto } from './option.dto';
import { IOpition } from './option.interface';
import { LoggingService } from 'src/common/logger/logger.service';

@Injectable()
export class OptionService {
  private readonly SERVICE_NAME = 'OptionService';

  constructor(
    private readonly optionRepository: OptionRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: GetOptionDto): Promise<IOpition[]> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;

    const list = await this.optionRepository.getAll(dto);
    this.logger.log(logbase, `list.length(${list.length})`);

    return list;
  }
}

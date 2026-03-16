import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { GetOptionDto, OpitionResDto } from './option.dto';
import { OptionRepository } from './option.repository';

@Injectable()
export class OptionService {
  private readonly SERVICE_NAME = 'OptionService';

  constructor(
    private readonly optionRepository: OptionRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: GetOptionDto): Promise<OpitionResDto[]> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;

    const list = await this.optionRepository.getAll(dto);
    this.logger.log(logbase, `list.length(${list.length})`);

    return list;
  }
}

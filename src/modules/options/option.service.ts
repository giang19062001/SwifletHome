import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { GetOptionDto } from './option.dto';
import { OptionRepository } from './option.repository';
import { GetOptionResDto } from './option.response';

@Injectable()
export class OptionService {
  private readonly SERVICE_NAME = 'OptionService';

  constructor(
    private readonly optionRepository: OptionRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: GetOptionDto): Promise<GetOptionResDto[]> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;
    const list = await this.optionRepository.getAll(dto);
    return list;
  }
}

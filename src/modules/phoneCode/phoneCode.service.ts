import { Injectable } from '@nestjs/common';
import { PhoneCodeRepository } from './phoneCode.repository';
import { IPhoneCode } from './phoneCode.interface';
import { LoggingService } from 'src/common/logger/logger.service';

@Injectable()
export class PhoneCodeService {
  private readonly SERVICE_NAME = 'PhoneCodeService';

  constructor(
    private readonly phoneCodeRepository: PhoneCodeRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(): Promise<IPhoneCode[]> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;

    const list = await this.phoneCodeRepository.getAll();
    this.logger.log(logbase, `list.length(${list.length})`);

    return list;
  }
}

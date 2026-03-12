import { Injectable } from '@nestjs/common';
import { PhoneCodeRepository } from './phoneCode.repository';
import { LoggingService } from 'src/common/logger/logger.service';
import { PhoneCodeResDto } from "./phoneCode.response";

@Injectable()
export class PhoneCodeService {
  private readonly SERVICE_NAME = 'PhoneCodeService';

  constructor(
    private readonly phoneCodeRepository: PhoneCodeRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(): Promise<PhoneCodeResDto[]> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;

    const list = await this.phoneCodeRepository.getAll();
    this.logger.log(logbase, `list.length(${list.length})`);

    return list;
  }
   async getDetail(countryCode: string): Promise<PhoneCodeResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getDetail:`;

    const result = await this.phoneCodeRepository.getDetail(countryCode);
    return result;
  }
}

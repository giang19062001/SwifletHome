import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { PhoneCodeRepository } from '../app/phoneCode.repository';
import { PhoneCodeAppResDto } from './phoneCode.response';

@Injectable()
export class PhoneCodeService {
  private readonly SERVICE_NAME = 'PhoneCodeService';

  constructor(
    private readonly phoneCodeRepository: PhoneCodeRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(): Promise<PhoneCodeAppResDto[]> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;
    const list = await this.phoneCodeRepository.getAll();
    return list;
  }
  async getDetail(countryCode: string): Promise<PhoneCodeAppResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getDetail:`;

    const result = await this.phoneCodeRepository.getDetail(countryCode);
    return result;
  }
}

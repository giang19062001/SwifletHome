import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { RequestConsigmentDto } from './consigment.dto';
import { ConsignmentAppRepository } from './consigment.repository';

@Injectable()
export class ConsignmentAppService {
  private readonly SERVICE_NAME = 'ConsignmentAppService';

  constructor(
    private readonly consignmentAppRepository: ConsignmentAppRepository,
    private readonly logger: LoggingService,
  ) {}

  async requestConsigment(userCode: string, dto: RequestConsigmentDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/requestConsigment:`;

    try {
      const result = await this.consignmentAppRepository.requestConsigment(userCode, dto);
      this.logger.log(logbase, `Yêu cầu ký gửi cho người dùng(${userCode}) thành công`);
      return result;
    } catch (error) {
      this.logger.error(logbase, JSON.stringify(error));
      return 0;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { GetAllConsignmentDto, RequestConsigmentDto } from './consigment.dto';
import { ConsignmentAppRepository } from './consigment.repository';
import { ConsignmentResDto } from './consignment.response';

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
  async GetAllConsignment(dto: GetAllConsignmentDto, userCode: string): Promise<{ total: number; list: ConsignmentResDto[] }> {
    const logbase = `${this.SERVICE_NAME}/GetAllConsignment:`;

    const total = await this.consignmentAppRepository.getTotal(dto, userCode);
    const list = await this.consignmentAppRepository.getAll(dto, userCode);
    this.logger.log(logbase, `total(${total})`);

    return { total, list };
  }
}

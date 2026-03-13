import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { LoggingService } from 'src/common/logger/logger.service';
import { ConsignmentAdminRepository } from './consignment.repository';
import { ConsignmentResDto } from './consignment.response';

@Injectable()
export class ConsignmentAdminService {
  private readonly SERVICE_NAME = 'ConsignmentAdminService';
  constructor(
    private readonly consignmentAdminRepository: ConsignmentAdminRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: PagingDto): Promise<{ total: number; list: ConsignmentResDto[] }> {
    const total = await this.consignmentAdminRepository.getTotal();
    const list = await this.consignmentAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(consignmentCode: string): Promise<ConsignmentResDto | null> {
    const result = await this.consignmentAdminRepository.getDetail(consignmentCode);
    return result;
  }
}

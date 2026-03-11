import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { LoggingService } from 'src/common/logger/logger.service';
import { ConsignmentAdminRepository } from './consignment.repository';
import { IConsignment } from './consignment.interface';

@Injectable()
export class ConsignmentAdminService {
  private readonly SERVICE_NAME = 'ConsignmentAdminService';
  constructor(
    private readonly consignmentAdminRepository: ConsignmentAdminRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: PagingDto): Promise<IList<IConsignment>> {
    const total = await this.consignmentAdminRepository.getTotal();
    const list = await this.consignmentAdminRepository.getAll(dto);
    return { total, list };
  }
}

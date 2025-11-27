import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { IUserHome, IUserHomeImageStr } from '../userHome.interface';
import { IList, YnEnum } from 'src/interfaces/admin.interface';
import { UserHomeAdminRepository } from './userHome.repository';
import { GetHomesAdminDto } from './userHome.dto';

@Injectable()
export class UserHomeAdminService {
  private readonly SERVICE_NAME = 'UserHomeAdminService';

  constructor(
    private readonly userHomeAdminRepository: UserHomeAdminRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: GetHomesAdminDto): Promise<IList<IUserHome>> {
    const total = await this.userHomeAdminRepository.getTotal(dto.userCode);
    const list = await this.userHomeAdminRepository.getAll(dto);
    return { total, list };
  }
}

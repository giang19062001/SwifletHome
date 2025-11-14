import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserAdminRepository } from './user.repository';
import { IUserAdmin } from './user.interface';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { IUserApp } from '../app/user.interface';

@Injectable()
export class UserAdminService {
  private readonly SERVICE_NAME = 'UserAdminService';

  constructor(
    private readonly userAdminRepository: UserAdminRepository,
    private readonly logger: LoggingService,
  ) {}

  async findByUserId(userId: string): Promise<IUserAdmin | null> {
    return await this.userAdminRepository.findByUserId(userId);
  }

  async getAll(dto: PagingDto): Promise<IList<IUserApp>> {
    const total = await this.userAdminRepository.getTotal(dto);
    const list = await this.userAdminRepository.getAll(dto);
    return { total, list };
  }
}

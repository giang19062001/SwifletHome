import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { IUserApp } from 'dist/modules/user/user.interface';
import { UserAdminRepository } from './user.repository';
import { IUserAdmin } from './user.interface';

@Injectable()
export class UserAdminService {
  private readonly SERVICE_NAME = 'UserAdminService';

  constructor(
    private readonly userAdminRepository: UserAdminRepository,
    private readonly logger: LoggingService,
  ) {}

  async findByUserId(userId: string): Promise<IUserAdmin  | null> {
    return await this.userAdminRepository.findByUserId(userId);
  }

}

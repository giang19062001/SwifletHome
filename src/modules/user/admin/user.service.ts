import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserAdminRepository } from './user.repository';
import { IUserAdmin } from './user.interface';
import { IList } from 'src/interfaces/admin.interface';
import { IUserAppInfo } from '../app/user.interface';
import { GetAllUserDto } from './user.dto';
import { UserPaymentAdminService } from 'src/modules/userPayment/admin/userPayment.service';
import { UpdateUserPaymentAdminDto } from 'src/modules/userPayment/admin/userPayment.dto';

@Injectable()
export class UserAdminService {
  private readonly SERVICE_NAME = 'UserAdminService';

  constructor(
    private readonly userAdminRepository: UserAdminRepository,
    private readonly userPaymentAdminService: UserPaymentAdminService,
    private readonly logger: LoggingService,
  ) {}

  async findByUserId(userId: string): Promise<IUserAdmin | null> {
    return await this.userAdminRepository.findByUserId(userId);
  }

  async getAll(dto: GetAllUserDto): Promise<IList<IUserAppInfo> | IList<IUserAdmin>> {
    if (dto.type == 'APP') {
      // app
      const total = await this.userAdminRepository.getTotalUserApp(dto);
      const list = await this.userAdminRepository.getAllUserApp(dto);
      return { total, list };
    } else {
      // admin
      return { total: 0, list: [] };
    }
  }

  async getDetail(userCode: string, type: string): Promise<IUserAppInfo | IUserAdmin | null> {
    if (type == 'APP') {
      // app
      return await this.userAdminRepository.getDetailUserApp(userCode);
    } else {
      // admin
      return null;
    }
  }

  async updatePackage(dto: UpdateUserPaymentAdminDto, userCode: string): Promise<number> {
    const result = await this.userPaymentAdminService.update(dto, userCode);
    return result;
  }
}

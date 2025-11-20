import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserAppRepository } from './user.repository';
import { RegisterAppDto } from 'src/modules/auth/app/auth.dto';
import { UserPaymentAppService } from 'src/modules/userPayment/app/userPayment.service';
import { CreateUserPaymentAppDto } from 'src/modules/userPayment/app/userPayment.dto';
import { IUserApp, IUserAppInfo } from './user.interface';

@Injectable()
export class UserAppService {
  private readonly SERVICE_NAME = 'UserAppService';

  constructor(
    private readonly userAppRepository: UserAppRepository,
    private readonly userPaymentService: UserPaymentAppService,
    private readonly logger: LoggingService,
  ) {}

  async findByPhone(userPhone: string): Promise<IUserApp | null> {
    return await this.userAppRepository.findByPhone(userPhone);
  }

  async getDetail(userCode: string): Promise<IUserAppInfo | null> {
    return await this.userAppRepository.getDetail(userCode);
  }

  async create(dto: RegisterAppDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/create`;

    const insertId = await this.userAppRepository.create(dto);
    if (insertId) {
      const user = await this.userAppRepository.findBySeq(insertId);
      if (user) {
        this.logger.log(logbase, 'Thiết lập gói miễn phí cho người dùng đăng kí mới');
        // mặc định user mới sẽ sử dụng gói miễn phí
        const dto: CreateUserPaymentAppDto = {
          userCode: user.userCode,
          packageCode: null,
          endDate: null,
          startDate: null,
        };
        await this.userPaymentService.create(dto);
      }
    }
    return 1;
  }

  
  async update(userName: string, userPhone: string, userCode: string): Promise<number> {
    return await this.userAppRepository.update(userName, userPhone, userCode);
  }
  async updatePassword(newPassword: string, userPhone: string): Promise<number> {
    return await this.userAppRepository.updatePassword(newPassword, userPhone);
  }

  async updateDeviceToken(deviceToken: string, userPhone: string): Promise<number> {
    return await this.userAppRepository.updateDeviceToken(deviceToken, userPhone);
  }
}

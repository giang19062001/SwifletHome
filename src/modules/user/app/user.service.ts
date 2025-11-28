import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserAppRepository } from './user.repository';
import { RegisterUserAppDto } from 'src/modules/auth/app/auth.dto';
import { IUserApp, IUserAppInfo } from './user.interface';
import { CreateUserPackageAppDto } from './user.dto';
import { NotificationAppService } from 'src/modules/notification/notification.service';

@Injectable()
export class UserAppService {
  private readonly SERVICE_NAME = 'UserAppService';

  constructor(
    private readonly userAppRepository: UserAppRepository,
    private readonly notificationAppService: NotificationAppService,
    private readonly logger: LoggingService,
  ) {}

  async findByPhone(userPhone: string): Promise<IUserApp | null> {
    return await this.userAppRepository.findByPhone(userPhone);
  }

  async getFullInfo(userCode: string): Promise<IUserAppInfo | null> {
    return await this.userAppRepository.getFullInfo(userCode);
  }

  async create(dto: RegisterUserAppDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/create`;

    const insertId = await this.userAppRepository.create(dto);
    if (insertId) {
      const user = await this.userAppRepository.findBySeq(insertId);
      if (user) {
        this.logger.log(logbase, 'Thiết lập gói miễn phí cho người dùng đăng kí mới');
        // mặc định user mới sẽ sử dụng gói miễn phí
        const dto: CreateUserPackageAppDto = {
          userCode: user.userCode,
          packageCode: null,
          endDate: null,
          startDate: null,
        };
        await this.createPackage(dto);

        // const topic = this.notificationAppService.getAllTopic({ limit: 0, page: 0 });
        // this.logger.log(logbase, 'Đăng ký các Topic tự động cho người dùng đăng kí mới');
        // await this.userAppRepository.subscribeToTopic(user.deviceToken);
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

  // TODO: PACKAGE
  async createPackage(dto: CreateUserPackageAppDto): Promise<number> {
    const createdAt = new Date();
    await this.userAppRepository.writePackageHistory(dto, createdAt);
    return await this.userAppRepository.createPackage(dto, createdAt);
  }
}

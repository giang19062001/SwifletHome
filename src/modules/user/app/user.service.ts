import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserAppRepository } from './user.repository';
import { RegisterUserAppDto } from 'src/modules/auth/app/auth.dto';
import { IUserApp } from './user.interface';
import { CreateUserPackageAppDto } from './user.dto';
import { ITokenUserApp } from 'src/modules/auth/app/auth.interface';

@Injectable()
export class UserAppService {
  private readonly SERVICE_NAME = 'UserAppService';

  constructor(
    private readonly userAppRepository: UserAppRepository,
    private readonly logger: LoggingService,
  ) {}

  async findByPhone(userPhone: string): Promise<ITokenUserApp | null> {
    return await this.userAppRepository.findByPhone(userPhone);
  }

  async getInfo(userCode: string): Promise<IUserApp | null> {
    return await this.userAppRepository.getInfo(userCode);
  }

  async register(dto: RegisterUserAppDto): Promise<ITokenUserApp | null> {
    const logbase = `${this.SERVICE_NAME}/register`;
    let userInserted: ITokenUserApp | null = null;
    const insertId = await this.userAppRepository.create(dto);
    if (insertId) {
      const user = await this.userAppRepository.findBySeq(insertId);
      if (user) {
        userInserted = user; // gán giá trị
        this.logger.log(logbase, 'Thiết lập gói miễn phí cho người dùng đăng kí mới');
        // mặc định user mới sẽ sử dụng gói miễn phí
        const dto: CreateUserPackageAppDto = {
          userCode: user.userCode,
          packageCode: null,
          endDate: null,
          startDate: null,
        };
        // tạo package cho user mới
        await this.createPackage(dto);
      }
    }
    return userInserted;
  }

  async update(userName: string, userPhone: string, userCode: string): Promise<number> {
    return await this.userAppRepository.update(userName, userPhone, userCode);
  }
  async updatePassword(newPassword: string, userPhone: string): Promise<number> {
    return await this.userAppRepository.updatePassword(newPassword, userPhone);
  }

  async updateDeviceToken(deviceToken: string, userPhone: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/updateDeviceToken`;
    this.logger.log(logbase, `Cập nhập device token mới cho người dùng (${userPhone})`);
    return await this.userAppRepository.updateDeviceToken(deviceToken, userPhone);
  }

  // TODO: PACKAGE
  async createPackage(dto: CreateUserPackageAppDto): Promise<number> {
    const createdAt = new Date();
    await this.userAppRepository.writePackageHistory(dto, createdAt);
    return await this.userAppRepository.createPackage(dto, createdAt);
  }
}

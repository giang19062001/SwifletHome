import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { TEXTS } from 'src/helpers/text.helper';
import { RegisterUserAppDto } from 'src/modules/auth/app/auth.dto';
import { TokenUserAppResDto, TokenUserAppWithPasswordResDto } from "../../auth/app/auth.dto";
import { CreateUserPackageAppDto, UserAppResDto } from './user.dto';
import { UserAppRepository } from './user.repository';
import { AllowUserTypeResDto, GetInfoUserAppResDto, UserTypeResDto } from './user.response';

@Injectable()
export class UserAppService {
  private readonly SERVICE_NAME = 'UserAppService';

  constructor(
    private readonly userAppRepository: UserAppRepository,
    private readonly logger: LoggingService,
  ) {}
  async findByCode(userCode: string): Promise<TokenUserAppWithPasswordResDto | null> {
    return await this.userAppRepository.findByCode(userCode);
  }

  async findByPhoneWithoutCountry(userPhone: string): Promise<TokenUserAppWithPasswordResDto | null> {
    return await this.userAppRepository.findByPhoneWithoutCountry(userPhone);
  }
  async findByPhone(userPhone: string, countryCode: string): Promise<TokenUserAppWithPasswordResDto | null> {
    return await this.userAppRepository.findByPhone(userPhone, countryCode);
  }
  async deleteAccount(userCode: string, user: TokenUserAppWithPasswordResDto): Promise<number> {
    try {
      return await this.userAppRepository.deleteAccount(userCode, user);
    } catch (error) {
      return 0;
    }
  }
  async getInfo(userCode: string): Promise<GetInfoUserAppResDto | null> {
    const info = await this.userAppRepository.getInfo(userCode);
    if ((info as any)?.packageCode && (info as any).packageRemainDay <= 0) {
      // gói hết hạn -> cho 'packageCode' là null
      return { ...info, packageCode: null, packageName: TEXTS.PACKAGE_FREE, packageDescription: '', startDate: null, endDate: null } as any;
    } else {
      return info;
    }
  }

  async register(dto: RegisterUserAppDto): Promise<TokenUserAppResDto | null> {
    const logbase = `${this.SERVICE_NAME}/register`;
    let userInserted: any = null;
    // Đã xóa: Không check deviceToken trùng lặp khi register
    // insert dữ liệu
    const insertId = await this.userAppRepository.register(dto);
    if (insertId) {
      const user = await this.userAppRepository.findBySeq(insertId);
      if (user) {
        userInserted = user; // gán giá trị
        this.logger.log(logbase, 'Thiết lập gói miễn phí cho người dùng đăng kí mới');
        // mặc định user mới sẽ sử dụng gói miễn phí
        const dto: CreateUserPackageAppDto = {
          userCode: (user as any).userCode,
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

  async clearDuplicateDeviceToken(deviceToken: string, excludeUserPhone?: string): Promise<{userCode: string}[]> {
    return await this.userAppRepository.clearDuplicateDeviceToken(deviceToken, excludeUserPhone);
  }

  // TODO: PACKAGE
  async createPackage(dto: CreateUserPackageAppDto): Promise<number> {
    const createdAt = new Date();
    await this.userAppRepository.writePackageHistory(dto, createdAt);
    return await this.userAppRepository.createPackage(dto, createdAt);
  }

  // TODO: TYPE
  async getAllUserType(): Promise<UserTypeResDto[]> {
    return await this.userAppRepository.getAllUserType();
  }
  async getOneUserType(userTypeCode: string): Promise<UserTypeResDto | null> {
    return await this.userAppRepository.getOneUserType(userTypeCode);
  }
  async getOneUserTypeByKeyword(userTypeKeyWord: string): Promise<UserTypeResDto | null> {
    return await this.userAppRepository.getOneUserTypeByKeyword(userTypeKeyWord);
  }
  async getAllowTypesOfUser(userCode: string, userTypeKeyWord: string): Promise<AllowUserTypeResDto[]> {
    // loại bỏ type đang active hiện tại
    const result = await this.userAppRepository.getAllowTypesOfUser(userCode);
    return result.filter((ele : AllowUserTypeResDto) => ele.userTypeKeyWord !== userTypeKeyWord)
  }

  async getUserPackageInfo(userCode: string) {
    return await this.userAppRepository.getUserPackageInfo(userCode);
  }

  async getAllUserCode() {
    return await this.userAppRepository.getAllUserCode();
  }
}

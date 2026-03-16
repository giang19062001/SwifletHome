import { BadRequestException, Injectable } from '@nestjs/common';
import moment from 'moment';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { LoggingService } from 'src/common/logger/logger.service';
import { NOTIFICATIONS } from 'src/helpers/text.helper';
import { PackageAdminService } from 'src/modules/package/admin/package.service';
import { TokenUserAdminResDto } from "../../auth/admin/auth.dto";
import { PackageResDto } from "../../package/package.response";
import { UserAppResDto } from "../app/user.dto";
import { GetAllUserDto, GetUsersForTeamByTypeDto, UpdateUserPackageAdminDto, UserForTeamByTypeResDto, UserTypeResDto } from './user.dto';
import { UserAdminRepository } from './user.repository';

@Injectable()
export class UserAdminService {
  private readonly SERVICE_NAME = 'UserAdminService';

  constructor(
    private readonly userAdminRepository: UserAdminRepository,
    private readonly packageAdminService: PackageAdminService,
    private readonly firebaseService: FirebaseService,
    private readonly logger: LoggingService,
  ) {}

  async findByUserId(userId: string): Promise<TokenUserAdminResDto | null> {
    return await this.userAdminRepository.findByUserId(userId);
  }

  async getAllUser(dto: GetAllUserDto): Promise<{ total: number; list: UserAppResDto[] } | { total: number; list: TokenUserAdminResDto[] }> {
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

  async getDetailUser(userCode: string, type: string): Promise<UserAppResDto | TokenUserAdminResDto | null> {
    if (type == 'APP') {
      // app
      return await this.getDetailUserApp(userCode);
    } else {
      // admin
      return null;
    }
  }

  //TODO: PACKAGE
  async updatePackage(dto: UpdateUserPackageAdminDto, updatedId: string, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/update`;

    const updatedAt = new Date();
    let startDate: string | null = null;
    let endDate: string | null = null;
    let packageData: PackageResDto | null = null;
    // chọn gói miễn phí
    if (!dto.packageCode) {
      startDate = null;
      endDate = null;
      this.logger.log(logbase, `${userCode} -> cập nhập gói miễn phí`);
    } else {
      // chọn các gói tính phí
      packageData = await this.packageAdminService.getDetail(dto.packageCode);
      if (!packageData) {
        throw new BadRequestException();
      }
      // ngày giờ hiện tại
      const datetime = moment();
      // ngày giờ kết thúc
      startDate = datetime.format('YYYY-MM-DD HH:mm:ss');
      // endOf -> 23:59:59
      endDate = datetime.clone().add(packageData.packageExpireDay, 'days').endOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.logger.log(logbase, `${userCode} -> cập nhập gói ${packageData?.packageName}(${packageData?.packageDescription})`);
    }
    //gửi nofity
    const isFristTimeUpgrage = await this.userAdminRepository.isFristTimesUpdatePackage(userCode);
    // đổi nội dung thông báo theo số lần cập nhập gói
    const notify = isFristTimeUpgrage
      ? NOTIFICATIONS.UPDATE_PACKAGE_FRIST_TIME(packageData, startDate ?? '', endDate ?? '')
      : NOTIFICATIONS.UPDATE_PACKAGE_TIMES(packageData, startDate ?? '', endDate ?? '');
    // cập nhập và ghi lịch sử
    await this.userAdminRepository.writePackageHistory(dto, userCode, startDate, endDate, updatedAt);
    const result = await this.userAdminRepository.updatePackage(dto, userCode, startDate, endDate, updatedId, updatedAt);
    if (result) {
      const user = await this.userAdminRepository.getDetailUserApp(userCode);
      if (user) {
        this.firebaseService.sendNotification((user as any).userCode, (user as any).deviceToken, notify.TITLE, notify.BODY);
      }
    }
    return result;
  }

  // TODO: TYPE
  async getTypesForTeam(): Promise<UserTypeResDto[]> {
    return await this.userAdminRepository.getTypesForTeam();
  }
  async getUsersForTeamByType(dto: GetUsersForTeamByTypeDto): Promise<UserForTeamByTypeResDto[]> {
    return await this.userAdminRepository.getUsersForTeamByType(dto);
  }

  async getDeviceTokensByUsers(userCodes: string[]) {
    return await this.userAdminRepository.getDeviceTokensByUsers(userCodes);
  }

  async getDetailUserApp(userCode: string) {
    return await this.userAdminRepository.getDetailUserApp(userCode);
  }
}

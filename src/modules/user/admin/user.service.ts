import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserAdminRepository } from './user.repository';
import { IUserAdmin } from './user.interface';
import { IList } from 'src/interfaces/admin.interface';
import { IUserAppInfo } from '../app/user.interface';
import { GetAllUserDto, UpdateUserPackageAdminDto } from './user.dto';
import { IPackage } from 'src/modules/package/package.interface';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { PackageAdminService } from 'src/modules/package/admin/package.service';
import moment from 'moment';

@Injectable()
export class UserAdminService {
  private readonly SERVICE_NAME = 'UserAdminService';

  constructor(
    private readonly userAdminRepository: UserAdminRepository,
    private readonly packageAdminService: PackageAdminService,
    private readonly firebaseService: FirebaseService,
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

  //TODO: PACKAGE
  async updatePackage(dto: UpdateUserPackageAdminDto, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/update`;

    const updatedAt = new Date();
    let startDate: string | null = null;
    let endDate: string | null = null;
    let packageData: IPackage | null = null;
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

    await this.userAdminRepository.writePackageHistory(dto, userCode, startDate, endDate, updatedAt);
    const result = await this.userAdminRepository.updatePackage(dto, userCode, startDate, endDate, updatedAt);
    if (result) {
      //gửi nofity
      this.firebaseService.sendNotification(
        'c5IcFc-dS9apRp4PbSgqoU:APA91bFyHwpnHANDbQUUzywUOTOIsT2xamQzjwI3J9SjpAh4H1HBaPad3e0kk2VFQ4hx1PegPmzizHOYl4FNnIOnGRLU2MxZBeSTIJOv_Vgk2C0oCEqd174',
        'Thông báo YenHome',
        `Gói ${!packageData ? 'Miễn phí' : (packageData as unknown as IPackage).packageName} đã được cập nhập thành công`,
      );
    }
    return result;
  }
}

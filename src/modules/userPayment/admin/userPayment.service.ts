import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Msg } from 'src/helpers/message.helper';
import { LoggingService } from 'src/common/logger/logger.service';
import moment from 'moment';
import { UserPaymentAdminRepository } from './userPayment.repository';
import { UpdateUserPaymentAdminDto } from './userPayment.dto';
import { PackageAdminService } from 'src/modules/package/admin/package.service';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { IPackage } from 'src/modules/package/package.interface';

@Injectable()
export class UserPaymentAdminService {
  private readonly SERVICE_NAME = 'UserPaymentAppService';

  constructor(
    private readonly userPaymentAdminRepository: UserPaymentAdminRepository,
    private readonly packageAdminService: PackageAdminService,
    private readonly firebaseService: FirebaseService,

    private readonly logger: LoggingService,
  ) {}

  async update(dto: UpdateUserPaymentAdminDto, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/update`;

    const updatedAt = new Date();
    let startDate: string | null = null;
    let endDate: string | null = null;
    let packageData : IPackage | null = null
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

    await this.userPaymentAdminRepository.createHistory(dto, userCode, startDate, endDate, updatedAt);
    const result = await this.userPaymentAdminRepository.update(dto, userCode, startDate, endDate, updatedAt);
    if (result) {
      //gửi nofity
      this.firebaseService.sendNotification(
        'c5IcFc-dS9apRp4PbSgqoU:APA91bFyHwpnHANDbQUUzywUOTOIsT2xamQzjwI3J9SjpAh4H1HBaPad3e0kk2VFQ4hx1PegPmzizHOYl4FNnIOnGRLU2MxZBeSTIJOv_Vgk2C0oCEqd174',
        'Thông báo YenHome',
        `Gói ${!packageData ? 'Miễn phí' : (packageData as unknown as IPackage).packageName} đã được cập nhập thành công`,
      );
    }
    return result
  }
}

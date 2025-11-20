import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Msg } from 'src/helpers/message';
import { LoggingService } from 'src/common/logger/logger.service';
import moment from 'moment';
import { UserPaymentAdminRepository } from './userPayment.repository';
import { UpdateUserPaymentAdminDto } from './userPayment.dto';
import { PackageAdminService } from 'src/modules/package/admin/package.service';

@Injectable()
export class UserPaymentAdminService {
  private readonly SERVICE_NAME = 'UserPaymentAppService';

  constructor(
    private readonly userPaymentAdminRepository: UserPaymentAdminRepository,
    private readonly packageAdminService: PackageAdminService,
    private readonly logger: LoggingService,
  ) {}

  async update(dto: UpdateUserPaymentAdminDto, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/update`;

    const updatedAt = new Date();
    let startDate: string | null = null;
    let endDate: string | null = null;
    // chọn gói miễn phí
    if (!dto.packageCode) {
      startDate = null;
      endDate = null;
      this.logger.log(logbase, `${userCode} -> cập nhập gói miễn phí`);
    } else {
    // chọn các gói tính phí
      const packageData = await this.packageAdminService.getDetail(dto.packageCode);
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
    return await this.userPaymentAdminRepository.update(dto, userCode, startDate, endDate, updatedAt);
  }
}

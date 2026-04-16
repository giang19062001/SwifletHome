import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import moment from 'moment';
import { LoggingService } from 'src/common/logger/logger.service';
import { PackageAdminService } from 'src/modules/package/admin/package.service';
import { CheckoutPayDto } from './checkout.dto';
import { CheckoutAppRepository } from './checkout.repository';
import { UPDATOR } from 'src/helpers/const.helper';
import { Msg, MsgDto } from 'src/helpers/message.helper';

@Injectable()
export class CheckoutAppService {
  private readonly SERVICE_NAME = 'CheckoutAppService';

  constructor(
    private readonly checkoutAppRepository: CheckoutAppRepository,
    private readonly packageAdminService: PackageAdminService,
    private readonly logger: LoggingService,
  ) {}


  async checkoutPay(dto: CheckoutPayDto): Promise<any> {
    const logbase = `${this.SERVICE_NAME}/checkoutPay`;

    // 1. Kiểm tra transaction_id đã tồn tại chưa (tránh xử lý trùng lặp từ RevenueCat retry)
    if (dto.transaction_id) {
      const exists = await this.checkoutAppRepository.existsByTransactionId(dto.transaction_id);
      if (exists) {
        this.logger.log(logbase, `transaction_id ${dto.transaction_id} ${Msg.CheckoutTransactionExist}`);
        throw new BadRequestException({ message: Msg.CheckoutTransactionExist, data: 0 });
      }
    }

    // 2. Lưu lại payload gửi lên
    let checkoutSeq: number | null = null;
    try {
      checkoutSeq = await this.checkoutAppRepository.saveCheckout(dto);
      this.logger.log(logbase, `Saved checkout for app_user_id: ${dto.app_user_id} seq: ${checkoutSeq}`);
    } catch (error) {
      this.logger.error(logbase, `Failed to save checkout for app_user_id: ${dto.app_user_id}`);
    }

    if (!dto.app_user_id) {
      throw new BadRequestException({ message: MsgDto.CannotNull('app_user_id'), data: 0 });
    }

    const userCode = dto.app_user_id;

    // 2. Lấy thông tin Package (mặc định tìm gói 1 năm - 365 ngày)
    const packageData = await this.checkoutAppRepository.getPackageByExpireDay(365);
    if (!packageData) {
      this.logger.error(logbase, Msg.CheckoutPackageNotFound);
      throw new BadRequestException({ message: Msg.CheckoutPackageNotFound, data: 0 });
    }

    const defaultPackageCode = packageData.packageCode;

    // 3. Tính toán thời gian
    const currentUserPackage = await this.checkoutAppRepository.getCurrentPackage(userCode);
    const now = moment();
    const updatedAt = new Date();
    const updatedId = UPDATOR

    // Không cộng dồn thời gian từ giao dịch cũ, luôn thiết lập mới từ hôm nay
    const startDateMoment = now.clone();
    const endDateMoment = startDateMoment.clone().add(packageData.packageExpireDay, 'days').endOf('day');
    this.logger.log(logbase, `${userCode} gia hạn gói từ hôm nay (không cộng dồn).`);

    const startDate = startDateMoment.format('YYYY-MM-DD HH:mm:ss');
    const endDate = endDateMoment.format('YYYY-MM-DD HH:mm:ss');

    // 4. Ghi lịch sử gói
    await this.checkoutAppRepository.writePackageHistory(defaultPackageCode, userCode, startDate, endDate, updatedAt, checkoutSeq);

    // 5. Cập nhập gói người dùng
    const result = await this.checkoutAppRepository.updatePackage(defaultPackageCode, userCode, startDate, endDate, updatedId, updatedAt, checkoutSeq);

    return result;
  }
}

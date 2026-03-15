import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { LoggingService } from 'src/common/logger/logger.service';
import { ConsignmentAdminRepository } from './consignment.repository';
import { ConsignmentResDto } from './consignment.response';
import { UpdateConsignmentDto } from './consignment.dto';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { NotificationAdminService } from 'src/modules/notification/admin/notification.service';
import { NOTIFICATION_CONST, NotificationTypeEnum } from 'src/modules/notification/notification.interface';
import { NOTIFICATIONS } from 'src/helpers/text.helper';
import { UserAdminService } from 'src/modules/user/admin/user.service';

@Injectable()
export class ConsignmentAdminService {
  private readonly SERVICE_NAME = 'ConsignmentAdminService';
  constructor(
    private readonly consignmentAdminRepository: ConsignmentAdminRepository,
    private readonly firebaseService: FirebaseService,
    private readonly notificationAdminService: NotificationAdminService,
    private readonly userAdminService: UserAdminService,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: PagingDto): Promise<{ total: number; list: ConsignmentResDto[] }> {
    const total = await this.consignmentAdminRepository.getTotal();
    const list = await this.consignmentAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(consignmentCode: string): Promise<ConsignmentResDto | null> {
    const result = await this.consignmentAdminRepository.getDetail(consignmentCode);
    return result;
  }
  async update(consignmentCode: string, dto: UpdateConsignmentDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/update:`;

    // send thông báo
    const user = await this.userAdminService.getDetailUserApp(dto.userCode);
    if (!user) return 0;
    this.firebaseService.sendNotification(user.userCode, user.deviceToken, NOTIFICATIONS.UPDATE_STATUS_CONSIGNMENT().TITLE, dto.noticeContent, null, NotificationTypeEnum.ADMIN_CONSIGNMENT);

    // cập nhập trạng thái, và xóa/ thêm địa chỉ tracking nếu có
    const result = await this.consignmentAdminRepository.update(consignmentCode, dto);
    return result;
  }
}

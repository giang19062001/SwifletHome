import { NotificationAdminRepository } from './notification.repository';
import { Injectable } from '@nestjs/common';
import { PushNotifycationByAdminDto } from './notification.dto';
import { LoggingService } from 'src/common/logger/logger.service';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { KEYWORDS } from 'src/helpers/const.helper';
import { UserAdminRepository } from 'src/modules/user/admin/user.repository';

@Injectable()
export class NotificationAdminService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly notificationAdminRepository: NotificationAdminRepository,
    private readonly userAdminRepository: UserAdminRepository,
    private readonly logger: LoggingService,
  ) {}
  async pushNotifycationByAdmin(dto: PushNotifycationByAdminDto, createdId: string): Promise<number> {
    try {
      if (dto.isSendAll == 'Y') {
        // lấy danh sách topic dùng cho tất cả user
        const topicCommon = await this.notificationAdminRepository.getDetailTopic(KEYWORDS.NOTIFICATION_TOPIC.COMMON);
        // gửi thông báo chung
        await this.firebaseService.sendNotificationToTopic(topicCommon?.topicCode ?? '', dto.title, dto.body);
      } else if (dto.isSendAll == 'N') {
        const userDeviceTokens = await this.userAdminRepository.getDeviceTokensByUsers(dto.userCodesMuticast);
        if (userDeviceTokens.length) {
          // gửi thông báo cho 1 vài user cụ thể
          await this.firebaseService.sendNotificationToMulticast(userDeviceTokens, dto.title, dto.body);
        }
      }

      return 1;
    } catch (error) {
      return 0;
    }
  }
}

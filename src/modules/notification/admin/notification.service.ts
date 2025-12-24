import { NotificationAdminRepository } from './notification.repository';
import { Injectable } from '@nestjs/common';
import { PushNotifycationByAdminDto, SentTypeEnum } from './notification.dto';
import { LoggingService } from 'src/common/logger/logger.service';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { KEYWORDS } from 'src/helpers/const.helper';
import { UserAdminRepository } from 'src/modules/user/admin/user.repository';
import { UserHomeAdminRepository } from 'src/modules/userHome/admin/userHome.repository';
import { ApiMutationResponse } from 'src/interfaces/admin.interface';
import { MsgAdmin } from 'src/helpers/message.helper';

@Injectable()
export class NotificationAdminService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly notificationAdminRepository: NotificationAdminRepository,
    private readonly userAdminRepository: UserAdminRepository,
    private readonly userHomeAdminRepository: UserHomeAdminRepository,
    private readonly logger: LoggingService,
  ) {}
  async pushNotifycationByAdmin(dto: PushNotifycationByAdminDto, createdId: string): Promise<ApiMutationResponse> {
    try {
      if (dto.sendType == SentTypeEnum.ALL) {
        // lấy danh sách topic dùng cho tất cả user
        const topicCommon = await this.notificationAdminRepository.getDetailTopic(KEYWORDS.NOTIFICATION_TOPIC.COMMON);
        // gửi thông báo chung
        await this.firebaseService.sendNotificationToTopic(topicCommon?.topicCode ?? '', dto.title, dto.body);
      } else if (dto.sendType == SentTypeEnum.USER) {
        const userDeviceTokens = await this.userAdminRepository.getDeviceTokensByUsers(dto.userCodesMuticast);
        if (userDeviceTokens.length) {
          // gửi thông báo cho 1 vài user cụ thể
          const result = await this.firebaseService.sendNotificationToMulticast(userDeviceTokens, dto.title, dto.body);
          if (result) {
            return { success: true, message: MsgAdmin.pushNotifyOk };
          } else {
            return { success: false, message: MsgAdmin.pushNotifyErr };
          }
        }
      } else if (dto.sendType == SentTypeEnum.PROVINCE) {
        const userHomes = await this.userHomeAdminRepository.getUserHomesByProvinces(dto.provinceCodesMuticast);
        // lọc các userCode duy nhất để chống trùng lặp có trong mảng
        const userDeviceTokens = Array.from(new Map(userHomes.map((item) => [item.userCode, item])).values()).map((item) => ({
          userCode: item.userCode,
          deviceToken: item.deviceToken,
        }));

        // gửi thông báo
        if (userDeviceTokens.length) {
          // gửi thông báo cho 1 vài user cụ thể
          const result = await this.firebaseService.sendNotificationToMulticast(userDeviceTokens, dto.title, dto.body);
          if (result) {
            return { success: true, message: MsgAdmin.pushNotifyOk };
          } else {
            return { success: false, message: MsgAdmin.pushNotifyErr };
          }
        } else {
          return { success: false, message: MsgAdmin.pushNotifyProvinceEmpty };
        }
      }
      return { success: true, message: MsgAdmin.pushNotifyOk };
    } catch (error) {
      return { success: false, message: MsgAdmin.pushNotifyErr };
    }
  }
}

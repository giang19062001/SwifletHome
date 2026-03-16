import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { LoggingService } from 'src/common/logger/logger.service';
import { MsgAdmin } from 'src/helpers/message.helper';
import { ApiMutationResponse } from 'src/interfaces/admin.interface';
import { UserAdminService } from 'src/modules/user/admin/user.service';
import { UserHomeAdminService } from 'src/modules/userHome/admin/userHome.service';
import { NOTIFICATION_CONST } from '../notification.interface';
import { PushNotifycationByAdminDto, SentTypeEnum } from './notification.dto';
import { NotificationAdminRepository } from './notification.repository';

@Injectable()
export class NotificationAdminService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly notificationAdminRepository: NotificationAdminRepository,
    private readonly userAdminService: UserAdminService,
    private readonly userHomeAdminService: UserHomeAdminService,
    private readonly logger: LoggingService,
  ) {}
  async pushNotifycationByAdmin(dto: PushNotifycationByAdminDto, createdId: string): Promise<ApiMutationResponse> {
    try {
      if (dto.sendType == SentTypeEnum.ALL) {
        // lấy danh sách topic dùng cho tất cả user
        const topicCommon = await this.notificationAdminRepository.getDetailTopic(NOTIFICATION_CONST.TOPIC.COMMON);
        // gửi thông báo chung
        await this.firebaseService.sendNotificationToTopic(topicCommon?.topicCode ?? '', dto.title, dto.body);
      } else if (dto.sendType == SentTypeEnum.USER) {
        const userDeviceTokens = await this.userAdminService.getDeviceTokensByUsers(dto.userCodesMuticast);
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
        const userHomes = await this.userHomeAdminService.getUserHomesByProvinces(dto.provinceCodesMuticast);
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
          return { success: false, message: MsgAdmin.pushProvinceEmpty };
        }
      }
      return { success: true, message: MsgAdmin.pushNotifyOk };
    } catch (error) {
      return { success: false, message: MsgAdmin.pushNotifyErr };
    }
  }

  async getDetailTopic(topicKeyWord: string) {
    return await this.notificationAdminRepository.getDetailTopic(topicKeyWord);
  }
}

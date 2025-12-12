import { NotificationAdminRepository } from './notification.repository';
import { Injectable } from '@nestjs/common';
import { PushNotifycationByAdminDto } from './notification.dto';
import { LoggingService } from 'src/common/logger/logger.service';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { KEYWORDS } from 'src/helpers/const.helper';

@Injectable()
export class NotificationAdminService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly notificationAdminRepository: NotificationAdminRepository,
    private readonly logger: LoggingService,
  ) {}
  async pushNotifycationByAdmin(dto: PushNotifycationByAdminDto, createdId: string): Promise<number> {
    if (dto.isSendAll == 'Y') {
        const topic = await this.notificationAdminRepository.getDetailTopic(KEYWORDS.NOTIFICATION_TOPIC.COMMON)
        await this.firebaseService.sendNotificationToTopic(topic?.topicCode ?? "", dto.title, dto.body)
    }

    return 1;
  }
}

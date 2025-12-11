import { INotification, INotificationTopic } from './notification.interface';
import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { NotificationAppRepository } from './notification.repository';
import { LoggingService } from 'src/common/logger/logger.service';

@Injectable()
export class NotificationAppService {
  private readonly SERVICE_NAME = 'NotificationAppService';

  constructor(
    private readonly notificationAppRepository: NotificationAppRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAllTopic(dto: PagingDto): Promise<IList<INotificationTopic>> {
    const logbase = `${this.SERVICE_NAME}/getAllTopic`;

    const total = await this.notificationAppRepository.getTotalTopic();
    const list = await this.notificationAppRepository.getAllTopic(dto);
    return { total, list };
  }
  async getDetail(notificationId: string, userCode: string): Promise<INotification | null> {
    const logbase = `${this.SERVICE_NAME}/getDetail`;
    const result = await this.notificationAppRepository.getDetail(notificationId, userCode);
    return result;
  }
  async maskAsRead(notificationId: string, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/getDetail`;
    this.logger.log(logbase, `Đánh dấu thông báo là đã đọc ${notificationId}`);
    const result = await this.notificationAppRepository.maskAsRead(notificationId, userCode);
    return result;
  }
}

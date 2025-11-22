import { INotificationTopic } from './notification.interface';
import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { NotificationAppRepository } from './notification.repository';

@Injectable()
export class NotificationAppService {
  constructor(private readonly notificationAppRepository: NotificationAppRepository) {}
  async getAllTopic(dto: PagingDto): Promise<IList<INotificationTopic>> {
    const total = await this.notificationAppRepository.getTotalTopic();
    const list = await this.notificationAppRepository.getAllTopic(dto);
    return { total, list };
  }
}

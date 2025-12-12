import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { INotification, INotificationTopic, IUserNotificationTopic, NotificationStatusEnum } from '../notification.interface';

@Injectable()
export class NotificationAdminRepository {
  private readonly updator = 'SYSTEM';

  private readonly table = 'tbl_notifications';
  private readonly tableTopic = 'tbl_notification_topics';
  private readonly tableUserTopic = 'tbl_user_notification_topics';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getDetailTopic(topicKeyword: string): Promise<INotificationTopic | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.topicCode, A.topicKeyword, A.topicName, A.topicDescription, A.isActive, A.createdAt, A.createdId
        FROM ${this.tableTopic} A
        WHERE A.topicKeyword = ? 
        LIMIT 1`,
      [topicKeyword],
    );
    return rows ? (rows[0] as INotificationTopic) : null;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { INotification, INotificationTopic } from './notification.interface';

@Injectable()
export class NotificationAppRepository {
  private readonly table = 'tbl_notifications';
  private readonly tableTopic = 'tbl_notification_topics';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<INotification[]> {
    let query = ` SELECT A.seq, A.title, A.body, A.data, A.userCode, A.topicCode, A.status, A.isActive, A.createdAt, A.createdId
        FROM ${this.table} A `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as INotification[];
  }
  async getDetail(seq: number): Promise<INotification | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.title, A.body, A.data, A.userCode, A.topicCode, A.status, A.isActive, A.createdAt, A.createdId
        FROM ${this.table} A 
        WHERE A.seq = ? 
        LIMIT 1`,
      [seq],
    );
    return rows ? (rows[0] as INotification) : null;
  }

  // TODO: TOPIC
  async getTotalTopic(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.tableTopic}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAllTopic(dto: PagingDto): Promise<INotificationTopic[]> {
    let query = ` SELECT A.seq, A.topicCode, A.topicName, A.data, A.topicDescription, A.isActive, A.createdAt, A.createdId
        FROM ${this.tableTopic} A `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as INotificationTopic[];
  }
  async getDetailTopic(topicCode: string): Promise<INotificationTopic | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.topicCode, A.topicName, A.data, A.topicDescription, A.isActive, A.createdAt, A.createdId
        FROM ${this.tableTopic} A
        WHERE A.topicCode = ? 
        LIMIT 1`,
      [topicCode],
    );
    return rows ? (rows[0] as INotificationTopic) : null;
  }

}

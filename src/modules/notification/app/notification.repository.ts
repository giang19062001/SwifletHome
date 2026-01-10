import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { CreateNotificationDto } from './notification.dto';
import { INotification, INotificationTopic, IUserNotificationTopic, NotificationStatusEnum } from '../notification.interface';
import { handleTimezoneQuery } from 'src/helpers/func.helper';
import { TEXTS } from 'src/helpers/text.helper';

@Injectable()
export class NotificationAppRepository {
  private readonly updator = 'SYSTEM';

  private readonly table = 'tbl_notifications';
  private readonly tableTopic = 'tbl_notification_topics';
  private readonly tableUserTopic = 'tbl_user_notification_topics';
  private readonly theQueryCountCommon = `(A.userCode = ? OR JSON_CONTAINS(A.userCodesMuticast, JSON_QUOTE(?)) OR A.topicCode = ?)  AND A.isActive = 'Y'`
  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getTotal(userCode: string, topicCode: string): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(A.seq) AS TOTAL FROM ${this.table} A
      WHERE ${this.theQueryCountCommon} `,
      [userCode, userCode, topicCode],
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto, userCode: string, topicCode: string): Promise<INotification[]> {
    let query = `
    SELECT A.seq, A.notificationId, A.messageId, A.title, A.body, A.targetScreen, A.data, 
           -- A.userCode, A.userCodesMuticast, A.topicCode,
            IF(A.notificationType = 'TODO', '${TEXTS.NOTIFICATION_TYPE_TODO}', A.notificationType) AS notificationType,
            A.notificationStatus, A.isActive, 
           ${handleTimezoneQuery('A.createdAt')}, A.createdId
    FROM ${this.table} A
    WHERE ${this.theQueryCountCommon}
    ORDER BY A.createdAt DESC
  `;

    const params: any[] = [userCode, userCode, topicCode];

    // paging
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as INotification[];
  }
  async getCntNotifyNotReadByUser(userCode: string, topicCode: string): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(A.seq)  AS TOTAL
        FROM ${this.table} A
        WHERE ${this.theQueryCountCommon} 
        AND A.notificationStatus = ?
        `,
      [userCode, userCode, topicCode, NotificationStatusEnum.SENT],
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }

  async getDetail(notificationId: string, userCode: string): Promise<INotification | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.notificationId, A.messageId, A.title, A.body, A.targetScreen, A.data, 
      -- A.userCode, A.userCodesMuticast, A.topicCode,
      A.notificationType, A.notificationStatus, A.isActive, DATE_FORMAT(A.createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt
        FROM ${this.table} A 
        WHERE A.notificationId = ? AND A.isActive = 'Y'
        LIMIT 1`,
      [notificationId, userCode],
    );
    return rows ? (rows[0] as INotification) : null;
  }

  async createNotification(dto: CreateNotificationDto): Promise<number> {
    const sql = `
        INSERT INTO ${this.table}  (notificationId, messageId, title, body, targetScreen, data, userCode, userCodesMuticast, topicCode, notificationType, notificationStatus, createdId) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.notificationId,
      dto.messageId,
      dto.title,
      dto.body,
      dto.targetScreen,
      dto.data,
      dto.userCode,
      dto.userCodesMuticast,
      dto.topicCode,
      dto.notificationType,
      dto.notificationStatus,
      this.updator,
    ]);

    return result.insertId;
  }

  async maskAsRead(notificationId: string, userCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET notificationStatus = ? , updatedId = ?, updatedAt = NOW()
      WHERE notificationId = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [NotificationStatusEnum.READ, userCode, notificationId]);

    return result.affectedRows;
  }

  async deteteNotification(notificationId: string, userCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET isActive = 'N' , updatedId = ?, updatedAt = NOW()
      WHERE notificationId = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, notificationId]);

    return result.affectedRows;
  }

  // TODO: TOPIC
  async getTotalTopic(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.tableTopic}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAllTopic(dto: PagingDto): Promise<INotificationTopic[]> {
    let query = ` SELECT A.seq, A.topicCode, A.topicName, A.topicDescription, A.isActive, A.createdAt, A.createdId
        FROM ${this.tableTopic} A `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as INotificationTopic[];
  }
  async getDetailTopic(topicKeyword: string): Promise<INotificationTopic | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.topicCode, A.topicKeyword, A.topicName, A.topicDescription
        FROM ${this.tableTopic} A
        WHERE A.topicKeyword = ? 
        LIMIT 1`,
      [topicKeyword],
    );
    return rows ? (rows[0] as INotificationTopic) : null;
  }
  // TODO: USER_TOPIC
  async getUserSubscribedTopics(userCode: string): Promise<IUserNotificationTopic[]> {
    let query = ` SELECT A.seq, A.topicCode, A.userCode, B.topicName
        FROM ${this.tableUserTopic} A 
        LEFT JOIN ${this.tableTopic} B
        ON A.topicCode = B.topicCode
        WHERE A.userCode = ? AND A.isActive = 'Y' `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [userCode]);
    return rows as IUserNotificationTopic[];
  }

  async subscribeToTopic(userCode: string, topicCode: string): Promise<number> {
    const query = `
        INSERT IGNORE INTO ${this.tableUserTopic} (userCode, topicCode)
        VALUES (?, ?)
      `;

    await this.db.query(query, [userCode, topicCode]);
    return 1;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { CreateNotificationDto, CreateNotificationOfUserDto, DeleteNotificationByStatusEnum } from './notification.dto';
import { INotification, INotificationTopic, IUserNotificationTopic, NOTIFICATION_CONST, NotificationStatusEnum, NotificationTypeEnum } from '../notification.interface';
import { handleTimezoneQuery } from 'src/helpers/func.helper';
import { TEXTS } from 'src/helpers/text.helper';
import { UPDATOR } from 'src/helpers/const.helper';

@Injectable()
export class NotificationAppRepository {
  private readonly table = 'tbl_notifications';
  private readonly tableUser = 'tbl_notifications_user';
  private readonly tableTopic = 'tbl_notification_topics';
  private readonly tableUserTopic = 'tbl_user_notification_topics';
  // private readonly theQueryCountCommon = `(A.userCode = ? OR JSON_CONTAINS(A.userCodesMuticast, JSON_QUOTE(?)) OR A.topicCode = ?)  AND A.isActive = 'Y'`;

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  // TODO: USER
  async getTotal(userCode: string): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(A.seq) AS TOTAL FROM ${this.tableUser} A
      WHERE A.userCode = ? AND A.isActive = 'Y' `,
      [userCode],
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto, userCode: string): Promise<INotification[]> {
    let query = `
    SELECT B.seq, B.notificationId, B.messageId, B.title, B.body, B.targetScreen, B.data, 
    B.notificationType,
      CASE
        WHEN B.notificationType = '${NOTIFICATION_CONST.NOTIFICATION_TYPE.ADMIN.value}' THEN '${NOTIFICATION_CONST.NOTIFICATION_TYPE.ADMIN.text}'
        WHEN B.notificationType = '${NOTIFICATION_CONST.NOTIFICATION_TYPE.TODO.value}' THEN '${NOTIFICATION_CONST.NOTIFICATION_TYPE.TODO.text}'
        WHEN B.notificationType = '${NOTIFICATION_CONST.NOTIFICATION_TYPE.ADMIN_QR.value}' THEN '${NOTIFICATION_CONST.NOTIFICATION_TYPE.ADMIN_QR.text}'
        ELSE  ''
    END AS notificationTypeLabel, 
            A.notificationStatus, A.isActive, 
           ${handleTimezoneQuery('A.createdAt')}, A.createdId
    FROM ${this.tableUser} A
    LEFT JOIN  ${this.table} B
    ON A.notificationId = B.notificationId
    WHERE  A.userCode = ? AND A.isActive = 'Y'
    ORDER BY A.createdAt DESC
  `;

    const params: any[] = [userCode];

    // paging
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as INotification[];
  }

  async getDetail(notificationId: string, userCode: string): Promise<INotification | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `   SELECT B.seq, B.notificationId, B.messageId, B.title, B.body, B.targetScreen, B.data, 
           B.notificationType,
      CASE
        WHEN B.notificationType = '${NOTIFICATION_CONST.NOTIFICATION_TYPE.ADMIN.value}' THEN '${NOTIFICATION_CONST.NOTIFICATION_TYPE.ADMIN.text}'
        WHEN B.notificationType = '${NOTIFICATION_CONST.NOTIFICATION_TYPE.TODO.value}' THEN '${NOTIFICATION_CONST.NOTIFICATION_TYPE.TODO.text}'
        WHEN B.notificationType = '${NOTIFICATION_CONST.NOTIFICATION_TYPE.ADMIN_QR.value}' THEN '${NOTIFICATION_CONST.NOTIFICATION_TYPE.ADMIN_QR.text}'
        ELSE  ''
    END AS notificationTypeLabel, 
            A.notificationStatus, A.isActive, 
           ${handleTimezoneQuery('A.createdAt')}, A.createdId
        FROM ${this.tableUser} A
        LEFT JOIN  ${this.table} B
        ON A.notificationId = B.notificationId
        WHERE A.notificationId = ? AND A.userCode = ? AND A.isActive = 'Y'
        LIMIT 1`,
      [notificationId, userCode],
    );
    return rows ? (rows[0] as INotification) : null;
  }

  async getCntNotifyNotReadByUser(userCode: string): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(A.seq)  AS TOTAL
        FROM ${this.tableUser} A
        WHERE A.userCode = ? AND A.isActive = 'Y'
        AND A.notificationStatus = ?
        `,
      [userCode, NotificationStatusEnum.SENT],
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }

  async maskAsRead(notificationId: string, userCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableUser} SET notificationStatus = ? , updatedId = ?, updatedAt = NOW()
      WHERE notificationId = ? AND userCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [NotificationStatusEnum.READ, userCode, notificationId, userCode]);

    return result.affectedRows;
  }

  async deteteNotification(notificationId: string, userCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableUser} SET isActive = 'N' , updatedId = ?, updatedAt = NOW()
      WHERE notificationId = ? AND userCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, notificationId, userCode]);

    return result.affectedRows;
  }

  async deteteNotificationByStatus(notificationStatus: DeleteNotificationByStatusEnum, userCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableUser} SET isActive = 'N' , updatedId = ?, updatedAt = NOW()
      WHERE userCode = ? AND isActive = 'Y' ${notificationStatus !== DeleteNotificationByStatusEnum.ALL ? ' AND notificationStatus = ? ' : ''}
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, notificationStatus !== DeleteNotificationByStatusEnum.ALL 
      ? [userCode, userCode, notificationStatus] 
      : [userCode, userCode]);

    return result.affectedRows;
  }

  async insertNotificationOfUser(dto: CreateNotificationOfUserDto): Promise<number> {
    const sql = `
        INSERT INTO ${this.tableUser}  (notificationId, userCode, notificationStatus, createdId) 
        VALUES(?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.notificationId, dto.userCode, dto.notificationStatus, UPDATOR]);
    return result.insertId;
  }

  // TODO: NOTI

  async insertNotification(dto: CreateNotificationDto): Promise<number> {
    const sql = `
        INSERT INTO ${this.table}  (notificationId, messageId, title, body, targetScreen, data, userCode, userCodesMuticast, topicCode,
        notificationType, createdId) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      UPDATOR,
    ]);

    return result.insertId;
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

import { Inject, Injectable } from '@nestjs/common';
import moment from 'moment';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { CODES, QUERY_HELPER } from 'src/helpers/const.helper';
import { generateCode } from 'src/helpers/func.helper';
import { TaskStatusEnum, TODO_CONST } from '../todo.interface';
import { TodoTaskResDto } from '../todo.response';
import { GetTaskAlarmResDto } from './todo.response';

@Injectable()
export class TodoAlarmAppRepository {
  private readonly tableUserApp = 'tbl_user_app';
  private readonly tableTask = 'tbl_todo_tasks';
  private readonly tableBoxTask = 'tbl_todo_box_tasks';
  private readonly tableTaskAlarm = 'tbl_todo_task_alarm';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  // TODO: BOX - TASK
  async getBoxTasks(): Promise<TodoTaskResDto[]> {
    let query = `  SELECT A.seq, A.taskCode, B.taskName, A.sortOrder FROM ${this.tableBoxTask} A
    LEFT JOIN ${this.tableTask} B
    ON A.taskCode = B.taskCode
    WHERE A.isActive = 'Y' `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as TodoTaskResDto[];
  }

  // TODO: TASK
  async getTasks(): Promise<TodoTaskResDto[]> {
    let query = `  SELECT seq, taskCode, taskName FROM ${this.tableTask} WHERE isActive = 'Y' `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as TodoTaskResDto[];
  }

  async getDetailTask(taskCode: string): Promise<TodoTaskResDto | null> {
    let query = `  SELECT seq, taskCode, taskName FROM ${this.tableTask} WHERE isActive = 'Y' AND taskCode  = ? LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskCode]);
    return rows.length ? (rows[0] as TodoTaskResDto) : null;
  }

  async getTaskByKeyword(taskKeyword: string): Promise<TodoTaskResDto | null> {
    let query = `  SELECT seq, taskCode, taskName FROM ${this.tableTask} WHERE isActive = 'Y' AND taskKeyword  = ? LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskKeyword]);
    return rows.length ? (rows[0] as TodoTaskResDto) : null;
  }

  // TODO: ALARM
  async updateDateOfTaskAlarm(taskDate: string, taskAlarmCode: string, userCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableTaskAlarm}
      SET taskDate = ?, updatedId = ?, updatedAt = NOW()
      WHERE taskAlarmCode = ?
  `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [taskDate, userCode, taskAlarmCode]);

    return result.affectedRows;
  }

  async getOneTaskAlarm(taskAlarmCode: string): Promise<GetTaskAlarmResDto | null> {
    let query = ` SELECT A.seq, A.taskAlarmCode, A.taskCode, B.taskKeyword, A.taskName, A.taskDate, A.taskStatus,
      A.userCode, A.userHomeCode, A.taskNote
      FROM ${this.tableTaskAlarm}  A
      LEFT JOIN ${this.tableTask} B
      ON A.taskCode = B.taskCode  
      WHERE A.taskAlarmCode  = ? 
      LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskAlarmCode]);
    return rows.length ? (rows[0] as GetTaskAlarmResDto) : null;
  }

  async getOneTaskAlarmsNearly(userCode: string, userHomeCode: string, taskCode: string, taskName: string, today: string): Promise<GetTaskAlarmResDto | null> {
    let query = `
        SELECT A.seq, A.userCode, A.userHomeCode, A.taskAlarmCode, A.taskCode, A.taskName,
              DATE_FORMAT(A.taskDate, '%Y-%m-%d') AS taskDate, A.taskStatus, A.taskNote, A.isActive
        FROM ${this.tableTaskAlarm} A
        WHERE A.isActive = 'Y'
          AND A.userCode = ?
          AND A.userHomeCode = ?
          AND A.taskCode = ?
          AND A.taskDate >= ?
          AND A.taskDate <= DATE_ADD(?, INTERVAL ${QUERY_HELPER.MAX_DAY_GET_LIST_ALARM} DAY)
          AND A.taskStatus = '${TaskStatusEnum.WAITING}'
        ORDER BY A.taskDate ASC
        LIMIT 1`;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [
      userCode,
      userHomeCode,
      taskCode,
      // taskName,
      today, // CURDATE()
      today, // o CURDATE()
    ]);

    return rows.length ? (rows[0] as GetTaskAlarmResDto) : null;
  }

  async getTotalTaskAlarm(userCode: string, userHomeCode: string): Promise<number> {
    // let whereQuery = ` AND A.userCode = ? AND A.userHomeCode = ? AND A.taskDate <= CURDATE() + INTERVAL ${QUERY_HELPER.MAX_DAY_GET_LIST_ALARM} DAY`;
    let whereQueryV2 = ` AND A.userCode = ? AND A.userHomeCode = ? AND A.taskCode IS NULL  
    AND A.taskDate <= CURDATE() + INTERVAL ${QUERY_HELPER.MAX_DAY_GET_LIST_ALARM} DAY`;

    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(A.seq) AS TOTAL FROM ${this.tableTaskAlarm} A
      INNER JOIN ${this.tableUserApp} B
      ON A.userCode = B.userCode
      WHERE A.isActive = 'Y' ${whereQueryV2} `,
      [userCode, userHomeCode],
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }

  async getListTaskAlarms(userCode: string, userHomeCode: string, dto: PagingDto): Promise<GetTaskAlarmResDto[]> {
    // let whereQuery = ` AND A.userCode = ? AND A.userHomeCode = ? AND A.taskDate <= CURDATE() + INTERVAL ${QUERY_HELPER.MAX_DAY_GET_LIST_ALARM} DAY`;
    let whereQueryV2 = ` AND A.userCode = ? AND A.userHomeCode = ?  AND A.taskCode IS NULL  
    AND A.taskDate <= CURDATE() + INTERVAL ${QUERY_HELPER.MAX_DAY_GET_LIST_ALARM} DAY`;

    let offsetQuery = ` `;

    let params: (string | number)[] = [userCode, userHomeCode];
    if (dto.limit != 0 && dto.page != 0) {
      offsetQuery += `LIMIT ? OFFSET ?`;
      params.push(dto.limit);
      params.push((dto.page - 1) * dto.limit);
    }
    let query = `
            SELECT A.seq, A.userCode, A.userHomeCode, A.taskAlarmCode, A.taskCode, A.taskName,
            DATE_FORMAT(A.taskDate, '%Y-%m-%d') AS taskDate, A.taskNote, A.isActive,  A.taskStatus, 
            CASE
                  WHEN A.taskStatus = '${TODO_CONST.TASK_STATUS.WAITING.value}' THEN '${TODO_CONST.TASK_STATUS.WAITING.text}'
                  WHEN A.taskStatus = '${TODO_CONST.TASK_STATUS.COMPLETE.value}' THEN '${TODO_CONST.TASK_STATUS.COMPLETE.text}'
                  WHEN A.taskStatus = '${TODO_CONST.TASK_STATUS.CANCEL.value}' THEN '${TODO_CONST.TASK_STATUS.CANCEL.text}'
                  ELSE ''
              END AS taskStatusLabel,
            '${TODO_CONST.TASK_EVENT.CANCEL.value}' AS leftEvent,
            '${TODO_CONST.TASK_EVENT.CANCEL.text}' AS leftEventLabel,
            '${TODO_CONST.TASK_EVENT.COMPLETE.value}' AS rightEvent,
            '${TODO_CONST.TASK_EVENT.COMPLETE.text}' AS rightEventLabel
            FROM ${this.tableTaskAlarm} A
            INNER JOIN ${this.tableUserApp} B
            ON A.userCode = B.userCode
            LEFT JOIN ${this.tableTask} C
            ON A.taskCode = C.taskCode
            WHERE A.isActive = 'Y'
              ${whereQueryV2} 
            ORDER BY A.taskDate DESC
              ${offsetQuery}`;
    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as GetTaskAlarmResDto[];
  }

  async getListTaskAlarmsToday(dateStr: string): Promise<(GetTaskAlarmResDto & { deviceToken: string })[]> {
    const query = `
        SELECT 
              A.seq, A.userCode, A.userHomeCode, A.taskAlarmCode, A.taskCode,
              A.taskName, DATE_FORMAT(taskDate, '%Y-%m-%d') AS taskDate, 
              A.taskStatus, A.taskNote, A.isActive, B.deviceToken
        FROM ${this.tableTaskAlarm} A
        INNER JOIN ${this.tableUserApp} B
          ON A.userCode = B.userCode
        WHERE A.isActive = 'Y'
            AND A.taskDate >= ?
            AND A.taskCode IS NULL  
            AND A.taskDate <= DATE_ADD(?, INTERVAL ${QUERY_HELPER.MAX_DAY_SEND_NOTIFY} DAY)
            AND A.taskStatus = '${TaskStatusEnum.WAITING}'
        ORDER BY A.taskDate DESC
      `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [dateStr, dateStr]);
    return rows as (GetTaskAlarmResDto & { deviceToken: string })[];
  }

  async changeTaskAlarmStatus(taskStatus: TaskStatusEnum, userCode: string, taskAlarmCode: string): Promise<number> {
    const sql = `
        UPDATE ${this.tableTaskAlarm}
        SET taskStatus = ?,  updatedId = ?, updatedAt = ?
        WHERE taskAlarmCode = ?  `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      taskStatus,
      userCode, // updatedId
      new Date(),
      taskAlarmCode,
    ]);

    return result.affectedRows;
  }

  async insertTaskAlarm(userCode: string, dto: any): Promise<number> {
    const sqlLast = ` SELECT taskAlarmCode FROM ${this.tableTaskAlarm} ORDER BY taskAlarmCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let taskAlarmCode = CODES.taskAlarmCode.FRIST_CODE;
    if (rows.length > 0) {
      taskAlarmCode = generateCode(rows[0].taskAlarmCode, CODES.taskAlarmCode.PRE, 6);
    }
    const sql = `
        INSERT INTO ${this.tableTaskAlarm}  (userCode, userHomeCode, taskAlarmCode, taskCode,
        taskName, taskDate, taskStatus, taskNote, createdId) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, dto.userHomeCode, taskAlarmCode, dto.taskCode, dto.taskName, dto.taskDate, dto.taskStatus, dto.taskNote, userCode]);

    return result.insertId;
  }

  async checkDuplicateTaskAlarm(userCode: string, dto: any): Promise<GetTaskAlarmResDto | null> {
    const query = `
        SELECT seq, userCode, userHomeCode, taskAlarmCode, taskCode, taskName, taskDate, taskNote, isActive
        FROM ${this.tableTaskAlarm}
        WHERE isActive = 'Y'
          AND taskName = ?
          AND taskDate = ?
          AND userHomeCode = ?
          AND userCode = ?
          AND taskStatus = '${TaskStatusEnum.WAITING}' 
        LIMIT 1
      `;

    const params = [dto.taskName, moment(dto.taskDate).format('YYYY-MM-DD'), dto.userHomeCode, userCode];

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);

    return rows?.length ? (rows[0] as GetTaskAlarmResDto) : null;
  }
}

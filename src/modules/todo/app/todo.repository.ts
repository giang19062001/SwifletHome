import { Injectable, Inject, Query } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ITodoHomeTaskAlram, ITodoHomeTaskPeriod, ITodoTask, PeriodTypeEnum, TaskStatusEnum } from '../todo.interface';
import { SetTaskAlarmDto, SetTaskPeriodDto } from './todo.dto';
import { CODES } from 'src/helpers/const.helper';
import { PagingDto } from 'src/dto/admin.dto';
import { generateCode } from 'src/helpers/func.helper';
import moment from 'moment';

@Injectable()
export class TodoAppRepository {
  private readonly tableTask = 'tbl_todo_tasks';
  private readonly tableHomeTaskAlarm = 'tbl_todo_home_task_alarm';
  private readonly tableHomeTaskPeriod = 'tbl_todo_home_task_period';
  private readonly tableBoxTask = 'tbl_todo_box_tasks';
  private readonly maxDayToGetList = 5;
  private readonly maxDayToSendNotify = 3;

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  // TODO: BOX - TASK
  async getBoxTasks(): Promise<ITodoTask[]> {
    let query = `  SELECT A.seq, A.taskCode, B.taskName, A.sortOrder FROM ${this.tableBoxTask} A
    LEFT JOIN ${this.tableTask} B
    ON A.taskCode = B.taskCode
    WHERE A.isActive = 'Y' `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as ITodoTask[];
  }
  // TODO: TASK
  async getTasks(): Promise<ITodoTask[]> {
    let query = `  SELECT seq, taskCode, taskName FROM ${this.tableTask} WHERE isActive = 'Y' `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as ITodoTask[];
  }
  async getDetailTask(taskCode: string): Promise<ITodoTask | null> {
    let query = `  SELECT seq, taskCode, taskName FROM ${this.tableTask} WHERE isActive = 'Y' AND taskCode  = ? LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskCode]);
    return rows.length ? (rows[0] as ITodoTask) : null;
  }

  // TODO: ALARM
  async getOneTaskAlarmsNearly(userCode: string, userHomeCode: string, taskCode: string, taskName: string, today: string): Promise<ITodoHomeTaskAlram | null> {
    let query = `
             SELECT A.seq, A.userCode, A.userHomeCode, A.taskAlarmCode, A.taskPeriodCode, A.taskName,
             DATE_FORMAT(A.taskDate, '%Y-%m-%d') AS taskDate, A.taskStatus, A.taskNote, A.isActive
             FROM ${this.tableHomeTaskAlarm} A
             LEFT JOIN ${this.tableHomeTaskPeriod} B
             ON A.taskPeriodCode = B.taskPeriodCode
             WHERE A.isActive = 'Y'
             AND A.userCode = ? AND A.userHomeCode = ?
             AND (
                 (A.taskPeriodCode IS NOT NULL AND B.taskCode = ?)
                 OR
                 (A.taskPeriodCode IS NULL AND A.taskName = ?)
             )
             AND A.taskDate >= ? AND A.taskDate <= ? + INTERVAL ${this.maxDayToGetList} DAY
             AND A.taskStatus = ${TaskStatusEnum.WAITING}
             ORDER BY A.taskDate ASC
             LIMIT 1`;
             console.log(query);

    const [rows] = await this.db.query<RowDataPacket[]>(query, [
      userCode,
      userHomeCode,
      taskCode,
      taskName,
      today, // CURDATE()
      today, // o CURDATE()
    ]);

    return rows.length ? (rows[0] as ITodoHomeTaskAlram) : null;
  }
  async getTotalTaskAlarm(userCode: string, userHomeCode: string): Promise<number> {
    let whereQuery = ` AND userCode = ? AND userHomeCode = ? AND taskDate <= CURDATE() + INTERVAL ${this.maxDayToGetList} DAY`;

    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(seq) AS TOTAL FROM ${this.tableHomeTaskAlarm}
      WHERE isActive = 'Y' ${whereQuery} `,
      [userCode, userHomeCode],
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getListTaskAlarms(userCode: string, userHomeCode: string, dto: PagingDto): Promise<ITodoHomeTaskAlram[]> {
    let whereQuery = ` AND userCode = ? AND userHomeCode = ? AND taskDate <= CURDATE() + INTERVAL ${this.maxDayToGetList} DAY`;
    let offsetQuery = ` `;

    let params: (string | number)[] = [userCode, userHomeCode];
    if (dto.limit != 0 && dto.page != 0) {
      offsetQuery += `LIMIT ? OFFSET ?`;
      params.push(dto.limit);
      params.push((dto.page - 1) * dto.limit);
    }
    let query = `
             SELECT seq, userCode, userHomeCode, taskAlarmCode, taskPeriodCode, taskName, DATE_FORMAT(taskDate, '%Y-%m-%d') AS taskDate, taskStatus, taskNote, isActive
            FROM ${this.tableHomeTaskAlarm} WHERE isActive = 'Y'
              ${whereQuery} 
            ORDER BY taskDate DESC
              ${offsetQuery}`;

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as ITodoHomeTaskAlram[];
  }
  async getListTaskAlarmsToday(dateStr: string): Promise<(ITodoHomeTaskAlram & { deviceToken: string })[]> {
    const query = `
    SELECT 
      A.seq, A.userCode, A.userHomeCode, A.taskAlarmCode, A.taskPeriodCode, 
      A.taskName, DATE_FORMAT(taskDate, '%Y-%m-%d') AS taskDate, 
      A.taskStatus, A.taskNote, A.isActive, B.deviceToken
    FROM ${this.tableHomeTaskAlarm} A
    JOIN tbl_user_app B
    ON A.userCode = B.userCode
    WHERE A.isActive = 'Y'
     AND A.taskDate >= ?
      AND A.taskDate <= DATE_ADD(?, INTERVAL ${this.maxDayToSendNotify} DAY)
    ORDER BY A.taskDate DESC

  `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [dateStr, dateStr]);
    return rows as (ITodoHomeTaskAlram & { deviceToken: string })[];
  }
  async changeTaskAlarmStatus(taskStatus: TaskStatusEnum, userCode: string, taskAlarmCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableHomeTaskAlarm}
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

  async insertTaskAlarm(userCode: string, dto: SetTaskAlarmDto): Promise<number> {
    const sqlLast = ` SELECT taskAlarmCode FROM ${this.tableHomeTaskAlarm} ORDER BY taskAlarmCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let taskAlarmCode = CODES.taskAlarmCode.FRIST_CODE;
    if (rows.length > 0) {
      taskAlarmCode = generateCode(rows[0].taskAlarmCode, CODES.taskAlarmCode.PRE, 6);
    }
    const sql = `
      INSERT INTO ${this.tableHomeTaskAlarm}  (userCode, userHomeCode, taskAlarmCode, taskPeriodCode, taskName, taskDate, taskStatus, taskNote, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, dto.userHomeCode, taskAlarmCode, dto.taskPeriodCode, dto.taskName, dto.taskDate, dto.taskStatus, dto.taskNote, userCode]);

    return result.insertId;
  }
  async checkDuplicateTaskAlarm(userCode: string, dto: SetTaskAlarmDto): Promise<ITodoHomeTaskAlram | null> {
    const query = `
      SELECT seq, userCode, userHomeCode, taskAlarmCode, taskPeriodCode, taskName, taskDate, taskNote, isActive
      FROM ${this.tableHomeTaskAlarm}
      WHERE isActive = 'Y'
        AND taskName = ?
        AND taskDate = ?
        AND userHomeCode = ?
        AND userCode = ?
      LIMIT 1
    `;

    const params = [dto.taskName, moment(dto.taskDate).format('YYYY-MM-DD'), dto.userHomeCode, userCode];

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);

    return rows?.length ? (rows[0] as ITodoHomeTaskAlram) : null;
  }
  // TODO: PERIOD
  async checkDuplicateTaskPeriod(userCode: string, dto: SetTaskPeriodDto): Promise<ITodoHomeTaskPeriod | null> {
    const query = `
      SELECT seq, userCode, userHomeCode, taskPeriodCode, taskCode, isCustomTask, taskCustomName, isPeriod, periodType, taskNote, periodValue, specificValue, isActive
      FROM ${this.tableHomeTaskPeriod}
      WHERE isActive = 'Y'
        AND (taskCode = ? OR (? IS NULL AND taskCode IS NULL))
        AND isCustomTask = ? AND taskCustomName = ? 
        AND isPeriod = ? 
        AND (periodType = ? OR (? IS NULL AND periodType IS NULL))
        AND (periodValue = ? OR (? IS NULL AND periodValue IS NULL))
        AND (specificValue = ? OR (? IS NULL AND specificValue IS NULL))
        AND userHomeCode = ? AND userCode = ?
      LIMIT 1
    `;

    // prettier-ignore
    const params = [
      dto.taskCode, dto.taskCode,
      dto.isCustomTask, dto.taskCustomName,
      dto.isPeriod,
      dto.periodType, dto.periodType,
      dto.periodValue, dto.periodValue,
      dto.specificValue ? moment(dto.specificValue).format('YYYY-MM-DD') : null,
      dto.specificValue ? moment(dto.specificValue).format('YYYY-MM-DD') : null,
      dto.userHomeCode, userCode,
    ];

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows?.length ? (rows[0] as ITodoHomeTaskPeriod) : null;
  }

  async getListTaskPeriodType(periodType: PeriodTypeEnum): Promise<ITodoHomeTaskPeriod[]> {
    let query = `
      SELECT seq, userCode, userHomeCode, taskPeriodCode, taskCode, isCustomTask, taskCustomName, isPeriod, periodType, periodValue, specificValue, taskNote, isActive
      FROM ${this.tableHomeTaskPeriod} WHERE isActive = 'Y' AND periodType = ?
      `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [periodType]);
    return rows as ITodoHomeTaskPeriod[];
  }
  async insertTaskPeriod(userCode: string, dto: SetTaskPeriodDto): Promise<{ taskPeriodCode: string; insertId: number }> {
    const sqlLast = ` SELECT taskPeriodCode FROM ${this.tableHomeTaskPeriod} ORDER BY taskPeriodCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let taskPeriodCode = CODES.taskPeriodCode.FRIST_CODE;
    if (rows.length > 0) {
      taskPeriodCode = generateCode(rows[0].taskPeriodCode, CODES.taskPeriodCode.PRE, 6);
    }
    const sql = `
      INSERT INTO ${this.tableHomeTaskPeriod}  (userCode, userHomeCode, taskPeriodCode, taskCode, isCustomTask, taskCustomName, isPeriod, periodType,
      periodValue, specificValue, taskNote, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      userCode,
      dto.userHomeCode,
      taskPeriodCode,
      dto.taskCode,
      dto.isCustomTask,
      dto.taskCustomName,
      dto.isPeriod,
      dto.periodType,
      dto.periodValue,
      dto.specificValue,
      dto.taskNote,
      userCode,
    ]);

    return { taskPeriodCode: taskPeriodCode, insertId: result.insertId };
  }
}

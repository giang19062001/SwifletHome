import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ITodoHomeTaskAlram, ITodoHomeTaskPeriod, ITodoTask } from '../todo.interface';
import { SetTaskAlarmDto, SetTaskPeriodDto, TaskStatusEnum, TaskTypeEnum } from './todo.dto';
import { CODES, KEYWORDS } from 'src/helpers/const.helper';
import { PagingDto } from 'src/dto/admin.dto';
import { generateCode } from 'src/helpers/func.helper';
import moment from 'moment';

@Injectable()
export class TodoAppRepository {
  private readonly tableTask = 'tbl_todo_tasks';
  private readonly tableHomeTaskAlarm = 'tbl_todo_home_task_alarm';
  private readonly tableHomeTaskPeriod = 'tbl_todo_home_task_period';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
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
  async getTotalTaskAlarm(userCode: string, userHomeCode: string): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(seq) AS TOTAL FROM ${this.tableHomeTaskAlarm}
      WHERE isActive = 'Y' AND userCode = ? AND userHomeCode = ? `,
      [userCode, userHomeCode],
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getListTaskAlarms(userCode: string, userHomeCode: string, dto: PagingDto): Promise<ITodoHomeTaskAlram[]> {
    let whereQuery = ` AND userCode = ? AND userHomeCode = ?  `;
    let offsetQuery = ` `;

    let params: (string | number)[] = [userCode, userHomeCode];
    if (dto.limit != 0 && dto.page != 0) {
      offsetQuery += `LIMIT ? OFFSET ?`;
      params.push(dto.limit);
      params.push((dto.page - 1) * dto.limit);
    }
    let query = `
             SELECT seq, userCode, userHomeCode, taskAlarmCode, taskPeriodCode, taskName, DATE_FORMAT(taskDate, '%Y-%m-%d') AS taskDate, taskStatus, isActive
            FROM ${this.tableHomeTaskAlarm} WHERE isActive = 'Y'
              ${whereQuery} 
            ORDER BY taskDate DESC
              ${offsetQuery}`;

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as ITodoHomeTaskAlram[];
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
  async checkDuplicateTaskAlarm(userCode: string, dto: SetTaskAlarmDto): Promise<ITodoHomeTaskAlram | null> {
    const query = `
      SELECT seq, userCode, userHomeCode, taskAlarmCode, taskPeriodCode, taskName, taskDate, isActive
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
  async insertTaskAlarm(userCode: string, dto: SetTaskAlarmDto): Promise<number> {
    const sqlLast = ` SELECT taskAlarmCode FROM ${this.tableHomeTaskAlarm} ORDER BY taskAlarmCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let taskAlarmCode = CODES.taskAlarmCode.FRIST_CODE;
    if (rows.length > 0) {
      taskAlarmCode = generateCode(rows[0].taskAlarmCode, CODES.taskAlarmCode.PRE, 6);
    }
    const sql = `
      INSERT INTO ${this.tableHomeTaskAlarm}  (userCode, userHomeCode, taskAlarmCode, taskPeriodCode, taskName, taskDate, taskStatus, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, dto.userHomeCode, taskAlarmCode, dto.taskPeriodCode, dto.taskName, dto.taskDate, dto.taskStatus, userCode]);

    return result.insertId;
  }
  // TODO: PERIOD
  async checkDuplicateTaskPeriod(userCode: string, dto: SetTaskPeriodDto): Promise<ITodoHomeTaskPeriod | null> {
    const query = `
      SELECT seq, userCode, userHomeCode, taskPeriodCode, taskCode, isCustomTask, taskCustomName, taskType, periodValue, specificValue, isActive
      FROM ${this.tableHomeTaskPeriod}
      WHERE isActive = 'Y'
        AND (taskCode = ? OR (? IS NULL AND taskCode IS NULL))
        AND isCustomTask = ? AND taskCustomName = ?  AND taskType = ?
        AND (periodValue = ? OR (? IS NULL AND periodValue IS NULL))
        AND (specificValue = ? OR (? IS NULL AND specificValue IS NULL))
        AND userHomeCode = ? AND userCode = ?
      LIMIT 1
    `;

    const params = [
      dto.taskCode,
      dto.taskCode,
      dto.isCustomTask,
      dto.taskCustomName,
      dto.taskType,
      dto.periodValue,
      dto.periodValue,
      dto.specificValue ? moment(dto.specificValue).format('YYYY-MM-DD') : null,
      dto.specificValue ? moment(dto.specificValue).format('YYYY-MM-DD') : null,
      dto.userHomeCode,
      userCode,
    ];

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows?.length ? (rows[0] as ITodoHomeTaskPeriod) : null;
  }

  async getListTaskPeriodByType(taskType: TaskTypeEnum): Promise<ITodoHomeTaskPeriod[]> {
    let query = `
      SELECT seq, userCode, userHomeCode, taskPeriodCode, taskCode, isCustomTask, taskCustomName, taskType, periodValue, specificValue, isActive
      FROM ${this.tableHomeTaskPeriod} WHERE isActive = 'Y' AND taskType = ?
      `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskType]);
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
      INSERT INTO ${this.tableHomeTaskPeriod}  (userCode, userHomeCode, taskPeriodCode, taskCode, isCustomTask, taskCustomName, taskType, periodValue, specificValue, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      userCode,
      dto.userHomeCode,
      taskPeriodCode,
      dto.taskCode,
      dto.isCustomTask,
      dto.taskCustomName,
      dto.taskType,
      dto.periodValue,
      dto.specificValue,
      userCode,
    ]);

    return { taskPeriodCode: taskPeriodCode, insertId: result.insertId };
  }
}

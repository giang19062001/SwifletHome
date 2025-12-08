import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ITodoHomeTaskAlram, ITodoTask } from '../todo.interface';
import { SetTaskAlarmDto } from './todo.dto';
import { CODES, KEYWORDS } from 'src/helpers/const.helper';
import { PagingDto } from 'src/dto/admin.dto';
import { generateCode } from 'src/helpers/func.helper';

@Injectable()
export class TodoAppRepository {
  private readonly tableTask = 'tbl_todo_tasks';
  private readonly tableHomeTask = 'tbl_todo_home_task_alarm';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getTasks(): Promise<ITodoTask[]> {
    let query = `  SELECT seq, taskCode, taskName FROM ${this.tableTask} WHERE isActive = 'Y' `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as ITodoTask[];
  }
  //prettier-ignore
  async checkDuplicateTaskAlarm(
    userCode: string,
    dto: SetTaskAlarmDto
  ): Promise<ITodoHomeTaskAlram | null> {
    const query = `
      SELECT seq, userCode, userHomeCode, taskCode, isCustomTask, taskCustomName,
            taskType, taskStatus, periodValue, specificValue, isActive
      FROM ${this.tableHomeTask}
      WHERE isActive = 'Y'
        AND (taskCode = ? OR (? IS NULL AND taskCode IS NULL))
        AND isCustomTask = ?
        AND taskCustomName = ?
        AND taskType = ?
        AND (periodValue = ? OR (? IS NULL AND periodValue IS NULL))
        AND (specificValue = ? OR (? IS NULL AND specificValue IS NULL))
        AND userHomeCode = ?
        AND userCode = ?
      LIMIT 1
    `;

    const params = [
      dto.taskCode, dto.taskCode,
      dto.isCustomTask, dto.taskCustomName,dto.taskType,
      dto.periodValue, dto.periodValue, dto.specificValue, dto.specificValue,
      dto.userHomeCode, userCode
    ]

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);

    return rows?.length ? (rows[0] as ITodoHomeTaskAlram) : null;
  }

  async getTotalTaskAlarm(userCode: string, userHomeCode: string): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(seq) AS TOTAL FROM ${this.tableHomeTask}
      WHERE isActive = 'Y' AND userCode = ? AND userHomeCode = ? `,
      [userCode, userHomeCode],
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getListTaskAlarms(userCode: string, userHomeCode: string, dto: PagingDto): Promise<ITodoHomeTaskAlram[]> {
    let whereQuery = ` AND userCode = ? AND userHomeCode = ?  `;
    let params: (string | number)[] = [userCode, userHomeCode];
    if (dto.limit != 0 && dto.page != 0) {
      whereQuery += `LIMIT ? OFFSET ?`;
      params.push(dto.limit);
      params.push((dto.page - 1) * dto.limit);
    }
    let query = `
             SELECT seq, userCode, userHomeCode, taskCode, isCustomTask, taskCustomName,
            taskType, taskStatus, periodValue, specificValue, isActive
            FROM ${this.tableHomeTask} WHERE isActive = 'Y'
              ${whereQuery} `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as ITodoHomeTaskAlram[];
  }
  async setTaskAlarm(userCode: string, dto: SetTaskAlarmDto): Promise<number> {
    const sqlLast = ` SELECT taskAlarmCode FROM ${this.tableHomeTask} ORDER BY taskAlarmCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let taskAlarmCode = CODES.taskAlarmCode.FRIST_CODE;
    if (rows.length > 0) {
      taskAlarmCode = generateCode(rows[0].taskAlarmCode, CODES.taskAlarmCode.PRE, 6);
    }
    const sql = `
      INSERT INTO ${this.tableHomeTask}  (userCode, userHomeCode, taskAlarmCode, taskCode, isCustomTask, taskCustomName, taskType, taskStatus, periodValue, specificValue, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      userCode,
      dto.userHomeCode,
      taskAlarmCode,
      dto.taskCode,
      dto.isCustomTask,
      dto.taskCustomName,
      dto.taskType,
      KEYWORDS.TODO_HOME_TASK_STATUS.WAITING, // mặc định là chờ
      dto.periodValue,
      dto.specificValue,
      userCode,
    ]);

    return result.insertId;
  }
}

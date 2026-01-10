import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { ITodoBoxTask, ITodoTask, TaskStatusEnum } from '../todo.interface';
import { SetTaskAlarmByAdminDto, UpdateBoxTaskDto } from './todo.dto';
import { generateCode } from 'src/helpers/func.helper';
import { CODES } from 'src/helpers/const.helper';

@Injectable()
export class TodoAdminRepository {
  private readonly tableTask = 'tbl_todo_tasks';
  private readonly tableBoxTask = 'tbl_todo_box_tasks';
  private readonly tableHomeTaskAlarm = 'tbl_todo_home_task_alarm';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotalTasks(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.tableTask} WHERE isActive = 'Y'`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAllTasks(dto: PagingDto): Promise<ITodoTask[]> {
    let query = `  SELECT seq, taskCode, taskName, createdId, createdAt
        FROM ${this.tableTask} 
        WHERE isActive = 'Y'
        ORDER BY createdAt DESC`;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as ITodoTask[];
  }
  // todo: BOX-TASK
  async getBoxTasks(): Promise<ITodoBoxTask[]> {
    let query = `  SELECT seq, taskCode, sortOrder, isActive
        FROM ${this.tableBoxTask} 
        WHERE isActive = 'Y' AND seq IN(1,2,3)
        ORDER BY sortOrder ASC
        LIMIT 3 `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as ITodoBoxTask[];
  }
  async updateBoxTask(dto: UpdateBoxTaskDto, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableBoxTask} SET taskCode = ?,  updatedId = ?, updatedAt = ?
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.taskCode, updatedId, new Date(), dto.seq]);

    return result.affectedRows;
  }

  // todo: ALARM
  async insertTaskAlarm(userCode: string, userHomeCode: string, dto: SetTaskAlarmByAdminDto, createdId: string): Promise<number> {
    const sqlLast = ` SELECT taskAlarmCode FROM ${this.tableHomeTaskAlarm} ORDER BY taskAlarmCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let taskAlarmCode = CODES.taskAlarmCode.FRIST_CODE;
    if (rows.length > 0) {
      taskAlarmCode = generateCode(rows[0].taskAlarmCode, CODES.taskAlarmCode.PRE, 6);
    }
    const sql = `
        INSERT INTO ${this.tableHomeTaskAlarm}  (userCode, userHomeCode, taskAlarmCode, taskPeriodCode, taskCode, taskName, taskDate, taskStatus, taskNote, createdId) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, userHomeCode, taskAlarmCode, null, dto.taskCode, dto.taskName, dto.taskDate, TaskStatusEnum.WAITING, "", createdId]);

    return result.insertId;
  }
}

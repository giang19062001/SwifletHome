import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ITodoTask } from '../todo.interface';
import { SetupTodoTaskDto } from './todo.dto';
import { KEYWORDS } from 'src/helpers/const.helper';

@Injectable()
export class TodoAppRepository {
  private readonly tableTask = 'tbl_todo_tasks';
  private readonly tableHomeTask = 'tbl_todo_home_task';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getTasks(): Promise<ITodoTask[]> {
    let query = `  SELECT seq, taskCode, taskName FROM ${this.tableTask} WHERE isActive = 'Y' `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as ITodoTask[];
  }

  async setupTodoTask(userCode: string, dto: SetupTodoTaskDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableHomeTask}  (userCode, userHomeCode, taskCode, isCustomTask, taskCustomName, taskType, taskStatus, periodValue, specificValue, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      userCode,
      dto.userHomeCode,
      dto.taskCode,
      dto.isCustomTask,
      dto.taskCustomName,
      dto.taskType,
      KEYWORDS.TODO_HOME_TASK_STATUS.WAITING, // mặc định là chờ
      dto.periodValue,
      dto.specificValue,
      userCode
    ]);

    return result.insertId;
  }
}

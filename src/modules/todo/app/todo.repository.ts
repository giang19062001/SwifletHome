import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { ITodoTask } from '../todo.interface';

@Injectable()
export class TodoAppRepository {
  private readonly tableTask = 'tbl_todo_tasks';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getTasks(): Promise<ITodoTask[]> {
    let query = `  SELECT seq, taskCode, taskName FROM ${this.tableTask} WHERE isActive = 'Y' `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as ITodoTask[];
  }
}

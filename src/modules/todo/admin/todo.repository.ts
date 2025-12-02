import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { ITodoTask } from '../todo.interface';

@Injectable()
export class TodoAdminRepository {
  private readonly tableTask = 'tbl_todo_tasks';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotalTasks(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.tableTask} WHERE isActive = 'Y'`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAllTasks(dto: PagingDto): Promise<ITodoTask[]> {
    let query = `  SELECT seq, taskCode, taskName, createdId, createdAt
        FROM ${this.tableTask} 
        WHERE isActive = 'Y'`;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as ITodoTask[];
  }
}

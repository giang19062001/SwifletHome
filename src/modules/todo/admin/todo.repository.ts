import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { ITodoBoxTask, ITodoTask } from '../todo.interface';
import { UpdateBoxTaskDto } from './todo.dto';

@Injectable()
export class TodoAdminRepository {
  private readonly tableTask = 'tbl_todo_tasks';
  private readonly tableBoxTask = 'tbl_todo_box_tasks';

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
  async getBoxTasks():  Promise<ITodoBoxTask[]> {
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
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.taskCode,  updatedId, new Date(), dto.seq]);

    return result.affectedRows;
  }
}

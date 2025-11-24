import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IScreen } from '../screen.interface';
import { IPaging, IList } from 'src/interfaces/admin.interface';
import { PagingDto } from 'src/dto/admin.dto';
import { UpdateScreenDto } from './screen.dto';

@Injectable()
export class ScreenAdminRepository {
  private readonly table = 'tbl_screen_config';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IScreen[]> {
    let query = `  SELECT seq, screenKeyword, screenName, screenContent, screenDescription, isActive, createdAt, updatedAt, createdId, updatedId 
        FROM ${this.table} `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IScreen[];
  }
  async getDetail(screenKeyword: string): Promise<IScreen | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `  SELECT A.seq, A.screenKeyword, A.screenName, A.screenContent, A.screenDescription, A.isActive,
        A.createdAt, A.updatedAt, A.createdId, A.updatedId 
        FROM ${this.table} A
        WHERE A.screenKeyword = ? 
        LIMIT 1`,
      [screenKeyword],
    );
    return rows ? (rows[0] as IScreen) : null;
  }

  async update(dto: UpdateScreenDto, updatedId: string, screenKeyword: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET screenName = ?, screenDescription = ?, screenContent = ?, updatedId = ?, updatedAt = ?
      WHERE screenKeyword = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.screenName, dto.screenDescription, dto.screenContent, updatedId, new Date(), screenKeyword]);

    return result.affectedRows;
  }
}

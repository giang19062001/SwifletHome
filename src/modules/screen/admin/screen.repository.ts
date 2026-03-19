import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { ScreenResDto } from "../screen.response";
import { UpdateScreenDto } from './screen.dto';

@Injectable()
export class ScreenAdminRepository {
  private readonly table = 'tbl_screen_config';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<ScreenResDto[]> {
    let query = `  SELECT seq, screenKeyword, screenName, screenContent, screenDescription, isActive, createdAt, updatedAt, createdId, updatedId 
        FROM ${this.table} ORDER BY createdAt DESC`;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    console.log(rows);
    return rows as ScreenResDto[];
  }
  async getDetail(screenKeyword: string): Promise<ScreenResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `  SELECT A.seq, A.screenKeyword, A.screenName, A.screenContent, A.screenDescription, A.isActive,
        A.createdAt, A.updatedAt, A.createdId, A.updatedId 
        FROM ${this.table} A
        WHERE A.screenKeyword = ? 
        LIMIT 1`,
      [screenKeyword],
    );
    return rows ? (rows[0] as ScreenResDto) : null;
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

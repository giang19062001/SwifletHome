import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { IInfo } from '../info.interface';
import { UpdateInfoDto } from './info.dto';

@Injectable()
export class InfoAdminRepository {
  private readonly table = 'tbl_info_config';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IInfo[]> {
    let query = `  SELECT seq, infoKeyword, infoName, infoContent, infoDescription, isActive, createdAt, updatedAt, createdId, updatedId 
        FROM ${this.table} `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IInfo[];
  }
  async getDetail(infoKeyword: string): Promise<IInfo | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `  SELECT A.seq, A.infoKeyword, A.infoName, A.infoContent, A.infoDescription, A.isActive,
        A.createdAt, A.updatedAt, A.createdId, A.updatedId 
        FROM ${this.table} A
        WHERE A.infoKeyword = ? 
        LIMIT 1`,
      [infoKeyword],
    );
    return rows ? (rows[0] as IInfo) : null;
  }

  async update(dto: UpdateInfoDto, updatedId: string, infoKeyword: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET infoContent = ?, updatedId = ?, updatedAt = ?
      WHERE infoKeyword = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.infoContent, updatedId, new Date(), infoKeyword]);

    return result.affectedRows;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IScreen } from '../screen.interface';
import { IPaging, IList } from 'src/interfaces/admin';
import { AbAdminRepo } from 'src/abstract/admin.repository';
import { PagingDto } from 'src/dto/admin';

@Injectable()
export class ScreenAdminRepository extends AbAdminRepo {
  private readonly table = 'tbl_screen_config';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {
    super();
  }

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
  create(dto: any): Promise<number> {
    throw new Error('Method not implemented.');
  }
  update(dto: any, id: string | number): Promise<number> {
    throw new Error('Method not implemented.');
  }
  delete(dto: string | number): Promise<number> {
    throw new Error('Method not implemented.');
  }
}

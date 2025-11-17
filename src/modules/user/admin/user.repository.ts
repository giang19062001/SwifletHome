import { Injectable, Inject } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { IUserAdmin } from './user.interface';
import { PagingDto } from 'src/dto/admin';
import { IUserApp } from '../app/user.interface';

@Injectable()
export class UserAdminRepository {
  private readonly tableAdmin = 'tbl_user_admin';
  private readonly tableApp = 'tbl_user_app';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async findByUserId(userId: string): Promise<IUserAdmin | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT seq, userId, userPassword, userName, isActive FROM ${this.tableAdmin} WHERE userId = ? LIMIT 1`, [userId]);
    return rows.length ? (rows[0] as IUserAdmin) : null;
  }

  async getTotal(dto: PagingDto): Promise<number> {
    let query = ` SELECT COUNT(seq) AS TOTAL  FROM ${this.tableApp}  `;
    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  
  async getAll(dto: PagingDto): Promise<IUserApp[]> {
    let query = ` SELECT A.seq, A.userCode, A.userName, A.userPassword, A.userPhone, A.deviceToken, A.isActive, A.createdAt, A.createdId, A.updatedAt, A.updatedId
                FROM ${this.tableApp} A  `;
    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IUserApp[];
  }
}

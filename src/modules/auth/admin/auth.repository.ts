import { Injectable, Inject } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { IUserAdmin } from './auth.interface';

@Injectable()
export class AuthAdminRepository {
  private readonly table = 'tbl_user_admin';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async findByUsername(userId: string): Promise<IUserAdmin | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT seq, userId, userPassword, userName, isActive FROM ${this.table} WHERE userId = ? LIMIT 1`,
      [userId],
    );
    return rows.length ? (rows[0] as IUserAdmin) : null;
  }
}

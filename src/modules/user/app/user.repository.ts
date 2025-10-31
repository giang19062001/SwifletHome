import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IUser } from '../user.interface';

@Injectable()
export class UserAppRepository {
  private readonly table = 'tbl_user_app';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getDetail(userCode: string): Promise<IUser | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone
        FROM ${this.table} A 
        WHERE A.userCode = ? 
        LIMIT 1`,
      [userCode],
    );
    return rows ? (rows[0] as IUser) : null;
  }

}

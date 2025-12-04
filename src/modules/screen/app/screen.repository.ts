import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IScreen } from '../screen.interface';

@Injectable()
export class ScreenAppRepository {
  private readonly table = 'tbl_screen_config';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getDetail(screenKeyword: string): Promise<IScreen | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.screenKeyword, A.screenName, A.screenContent, A.screenDescription, A.isDelete
        FROM ${this.table} A WHERE A.screenKeyword = ? AND A.isDelete = 'Y'
        LIMIT 1`,
      [screenKeyword],
    );
    return rows ? (rows[0] as IScreen) : null;
  }
}

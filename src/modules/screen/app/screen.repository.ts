import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { ScreenResDto } from "../screen.response";

@Injectable()
export class ScreenAppRepository {
  private readonly table = 'tbl_screen_config';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getDetail(screenKeyword: string): Promise<ScreenResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.screenKeyword, A.screenName, A.screenContent, A.screenDescription, A.isActive
        FROM ${this.table} A WHERE A.screenKeyword = ? AND A.isActive = 'Y'
        LIMIT 1`,
      [screenKeyword],
    );
    return rows ? (rows[0] as ScreenResDto) : null;
  }
}

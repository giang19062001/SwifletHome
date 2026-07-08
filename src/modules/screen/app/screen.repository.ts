import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { ScreenAppResDto, ScreenVideoAppResDto } from './screen.response';

@Injectable()
export class ScreenAppRepository {
  private readonly table = 'tbl_screen_config';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getDetail(screenKeyword: string): Promise<ScreenAppResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.screenKeyword, A.screenName, A.screenDescription, A.contentStart, A.contentCenter, A.contentEnd, A.screenTeamplateKeyword, A.screenSupportContent, A.isActive
        FROM ${this.table} A WHERE A.screenKeyword = ? AND A.isActive = 'Y'
        LIMIT 1`,
      [screenKeyword],
    );
    return rows ? (rows[0] as ScreenAppResDto) : null;
  }

  async getAllVideosByTable(tableVideo: string): Promise<ScreenVideoAppResDto[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(`SELECT name, address, videoTitle, videoUrl FROM ${tableVideo} WHERE isActive = 'Y' ORDER BY sortOrder ASC, createdAt DESC`);
    return rows as unknown as ScreenVideoAppResDto[];
  }
}

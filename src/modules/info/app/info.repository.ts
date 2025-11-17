import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin';
import { IInfo } from '../info.interface';

@Injectable()
export class InfoAppRepository {
  private readonly table = 'tbl_info_config';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getDetail(infoCharacter: string): Promise<IInfo | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.infoCharacter, A.infoName, A.infoContent, A.infoDescription, A.isActive
        FROM ${this.table} A WHERE A.infoCharacter = ? AND A.isActive = 'Y'
        LIMIT 1`,
      [infoCharacter],
    );
    return rows ? (rows[0] as IInfo) : null;
  }
}

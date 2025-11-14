import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/common';
import { IContent } from '../content.interface';

@Injectable()
export class ContentAppRepository {
  private readonly table = 'tbl_content_system';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getDetail(contentCharacter: string): Promise<IContent | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.contentCharacter, A.contentName, A.contentContent, A.contentDescription, A.isActive
        FROM ${this.table} A WHERE A.contentCharacter = ? AND A.isActive = 'Y'
        LIMIT 1`,
      [contentCharacter],
    );
    return rows ? (rows[0] as IContent) : null;
  }
}

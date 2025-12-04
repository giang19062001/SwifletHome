import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IBlog } from '../blog.interface';

@Injectable()
export class BlogAdppRepository {
  private readonly table = 'tbl_blog';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getOneContent(): Promise<IBlog | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.blogCode, A.blogName, A.blogContent, A.isFree
        FROM ${this.table} A 
        WHERE A.isDelete = 'Y' AND A.isMain = 'Y'
        LIMIT 1 `,
      [],
    );
    return rows ? (rows[0] as IBlog) : null;
  }
  
}

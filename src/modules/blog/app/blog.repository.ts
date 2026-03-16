import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { BlogResDto } from "../blog.response";

@Injectable()
export class BlogAdppRepository {
  private readonly table = 'tbl_blog';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getOneContent(): Promise<BlogResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.blogCode, A.blogName, A.blogContent, A.isFree
        FROM ${this.table} A 
        WHERE A.isActive = 'Y' AND A.isMain = 'Y'
        LIMIT 1 `,
      [],
    );
    return rows ? (rows[0] as BlogResDto) : null;
  }
  
}

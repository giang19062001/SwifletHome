import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { ICategoryFaq } from './categoryFaq.interface';
import { PagingDto } from 'src/dto/common';

@Injectable()
export class CateFaqRepository {
  private readonly table = 'tbl_category';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`,
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<ICategoryFaq[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT seq, categoryCode, categoryName, isActive, createdAt, updatedAt, createdId, updatedId 
        FROM ${this.table}  ${dto.limit == 0 && dto.page == 0 ? '' : 'LIMIT ? OFFSET ?'} `,
      dto.limit == 0 && dto.page == 0
        ? []
        : [dto.limit, (dto.page - 1) * dto.limit],
    );
    return rows as ICategoryFaq[];
  }
}

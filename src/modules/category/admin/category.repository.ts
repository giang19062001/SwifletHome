import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { ICategory } from '../category.interface';

@Injectable()
export class CategoryAdminRepository {
  private readonly table = 'tbl_category';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}  WHERE isActive = 'Y'`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<ICategory[]> {
    let query = `  SELECT seq, categoryCode, categoryName, isActive, createdAt, updatedAt, createdId, updatedId 
        FROM ${this.table} WHERE isActive = 'Y' `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as ICategory[];
  }
}

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { IObject } from '../object.interface';

@Injectable()
export class ObjectAdminRepository   {
  private readonly table = 'tbl_object';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {
  }

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}  WHERE isDelete = 'Y' `);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IObject[]> {
    let query = `  SELECT seq, objectKeyword, objectName, isDelete, createdAt, updatedAt, createdId, updatedId 
        FROM ${this.table} 
         WHERE isDelete = 'Y' `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IObject[];
  }
}

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { IPackage } from '../package.interface';

@Injectable()
export class PackageAdminRepository {
  private readonly table = 'tbl_package';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}  WHERE isActive = 'Y' `);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IPackage[]> {
    let query = `  SELECT seq, packageCode, packageName, packagePrice, packageItemSamePrice, packageExpireDay, packageDescription, isActive, createdAt, updatedAt, createdId, updatedId 
        FROM ${this.table}
         WHERE isActive = 'Y' `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IPackage[];
  }
  async getDetail(packageCode: string): Promise<IPackage | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT seq, packageCode, packageName, packagePrice, packageItemSamePrice, packageExpireDay, packageDescription, isActive, createdAt, updatedAt, createdId, updatedId 
        FROM ${this.table} 
        WHERE packageCode = ? AND isActive = 'Y'`,
      [packageCode],
    );
    return rows ? (rows[0] as IPackage) : null;
  }
}

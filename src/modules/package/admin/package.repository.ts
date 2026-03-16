import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { formatDecimal } from 'src/helpers/func.helper';
import { PackageResDto } from "../package.response";
import { UpdatePackageDto } from './package.dto';

@Injectable()
export class PackageAdminRepository {
  private readonly table = 'tbl_package';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}  WHERE isActive = 'Y' `);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<PackageResDto[]> {
    let query = `  SELECT seq, packageCode, packageName, packagePrice, packageItemSamePrice, packageExpireDay, packageDescription,
        packageOptionType, isActive, createdAt, updatedAt, createdId, updatedId 
        FROM ${this.table}
         WHERE isActive = 'Y' 
         ORDER BY createdAt DESC`;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as PackageResDto[];
  }
  async getDetail(packageCode: string): Promise<PackageResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT seq, packageCode, packageName, packagePrice, packageItemSamePrice, packageExpireDay, packageDescription,
        packageOptionType, isActive, createdAt, updatedAt, createdId, updatedId 
        FROM ${this.table} 
        WHERE packageCode = ? AND isActive = 'Y'`,
      [packageCode],
    );
    return rows ? (rows[0] as PackageResDto) : null;
  }
  async update(dto: UpdatePackageDto, updatedId: string, packageCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET packageName = ?, packagePrice = ?, packageItemSamePrice = ?, packageExpireDay = ?,
      packageOptionType = ?, updatedId = ?, updatedAt = ?
      WHERE packageCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.packageName,
      String(dto.packagePrice).trim() == '' ? 0 : formatDecimal(dto.packagePrice),
      dto.packageItemSamePrice,
      dto.packageExpireDay,
      dto.packageOptionType,
      updatedId,
      new Date(),
      packageCode,
    ]);

    return result.affectedRows;
  }
}

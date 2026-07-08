import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { ProvinceAppResDto } from './province.response';

@Injectable()
export class ProvinceRepository {
  private readonly table = 'tbl_provinces';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getAll(): Promise<ProvinceAppResDto[]> {
    const query = `  SELECT seq, provinceCode, provinceName FROM ${this.table} ORDER BY provinceName ASC `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as ProvinceAppResDto[];
  }
}

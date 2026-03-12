import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { ProvinceResDto } from "./province.response";

@Injectable()
export class ProvinceRepository {
  private readonly table = 'tbl_provinces';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getAll(): Promise<ProvinceResDto[]> {
    let query = `  SELECT seq, provinceCode, provinceName FROM ${this.table} `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as ProvinceResDto[];
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { PhoneCodeResDto } from "./phoneCode.response";

@Injectable()
export class PhoneCodeRepository {
  private readonly table = 'tbl_phone_code';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getAll(): Promise<PhoneCodeResDto[]> {
    let query = `  SELECT seq, countryName, countryCode, isoCode FROM ${this.table} `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as PhoneCodeResDto[];
  }

  async getDetail(countryCode: string): Promise<PhoneCodeResDto | null> {
    let query = `  SELECT seq, countryName, countryCode, isoCode FROM ${this.table} WHERE countryCode = ? `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [countryCode]);
    return rows.length ? rows[0] as PhoneCodeResDto : null;
  }
}

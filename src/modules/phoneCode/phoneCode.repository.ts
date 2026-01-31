import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { IPhoneCode } from './phoneCode.interface';

@Injectable()
export class PhoneCodeRepository {
  private readonly table = 'tbl_phone_code';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getAll(): Promise<IPhoneCode[]> {
    let query = `  SELECT seq, countryName, countryCode, isoCode FROM ${this.table} `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as IPhoneCode[];
  }

  async getDetail(countryCode: string): Promise<IPhoneCode | null> {
    let query = `  SELECT seq, countryName, countryCode, isoCode FROM ${this.table} WHERE countryCode = ? `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [countryCode]);
    return rows.length ? rows[0] as IPhoneCode : null;
  }
}

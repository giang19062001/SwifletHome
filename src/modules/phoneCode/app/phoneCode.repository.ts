import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { PhoneCodeAppResDto } from './phoneCode.response';

@Injectable()
export class PhoneCodeRepository {
  private readonly table = 'tbl_phone_code';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getAll(): Promise<PhoneCodeAppResDto[]> {
    const query = `  SELECT seq, countryName, countryCode, isoCode, languageCode FROM ${this.table} `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as PhoneCodeAppResDto[];
  }

  async getDetail(countryCode: string): Promise<PhoneCodeAppResDto | null> {
    const query = `  SELECT seq, countryName, countryCode, isoCode, languageCode FROM ${this.table} WHERE countryCode = ? `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [countryCode]);
    return rows.length ? (rows[0] as PhoneCodeAppResDto) : null;
  }
}

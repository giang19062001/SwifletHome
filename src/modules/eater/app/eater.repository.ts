import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { CODES } from 'src/helpers/const.helper';
import { generateCode } from 'src/helpers/func.helper';
import { UserEaterRecord } from './eater.interface';

@Injectable()
export class EaterAppRepository {
  private readonly table = 'tbl_eater';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async findByDeviceToken(deviceToken: string): Promise<UserEaterRecord | null> {
    if (!deviceToken || deviceToken === '') return null;
    const sql = `SELECT eaterCode, deviceToken, entryTime, createdAt, updatedAt FROM ${this.table} WHERE deviceToken = ? LIMIT 1`;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, [deviceToken]);
    return rows.length ? (rows[0] as UserEaterRecord) : null;
  }

  async updateEntryTime(deviceToken: string): Promise<boolean> {
    const sql = `UPDATE ${this.table} SET entryTime = NOW(), updatedAt = NOW() WHERE deviceToken = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [deviceToken]);
    return result.affectedRows > 0;
  }

  async insertEater(deviceToken: string): Promise<string | null> {
    try {
      const sqlLast = `SELECT eaterCode FROM ${this.table} ORDER BY eaterCode DESC LIMIT 1`;
      const [[last]] = await this.db.execute<any[]>(sqlLast);

      let eaterCode = CODES.eaterCode.FRIST_CODE;
      if (last && last.eaterCode) {
        eaterCode = generateCode(last.eaterCode, CODES.eaterCode.PRE, CODES.eaterCode.LEN);
      }

      const sql = `INSERT INTO ${this.table} (eaterCode, deviceToken, entryTime, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW(), NOW())`;
      await this.db.execute<ResultSetHeader>(sql, [eaterCode, deviceToken]);

      return eaterCode;
    } catch (error) {
      console.log('insertEater error: ', error);
      return null;
    }
  }
}

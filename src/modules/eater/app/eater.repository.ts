import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { CODES } from 'src/helpers/const.helper';
import { generateCode } from 'src/helpers/func.helper';
import { USER_CONST } from 'src/modules/user/app/user.const';
import { TokenEaterAppResDto } from '../../auth/app/auth.response';
import { UserEaterRecord } from './eater.interface';

@Injectable()
export class EaterAppRepository {
  private readonly table = 'tbl_eater';
  private readonly tableType = 'tbl_user_type';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async findByDeviceToken(deviceToken: string): Promise<UserEaterRecord | null> {
    if (!deviceToken || deviceToken === '') return null;
    const sql = `SELECT seq, eaterCode, deviceToken, userTypeKeyWord, entryTime, createdAt, updatedAt FROM ${this.table} WHERE deviceToken = ? LIMIT 1`;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, [deviceToken]);
    return rows.length ? (rows[0] as UserEaterRecord) : null;
  }

  async findEaterByCode(eaterCode: string): Promise<TokenEaterAppResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT seq, eaterCode, deviceToken, userTypeKeyWord FROM ${this.table} WHERE eaterCode = ? LIMIT 1 `, [eaterCode]);
    return rows.length ? (rows[0] as TokenEaterAppResDto) : null;
  }

  async updateEntryTime(deviceToken: string): Promise<boolean> {
    const sql = `UPDATE ${this.table} SET entryTime = NOW(), updatedAt = NOW() WHERE deviceToken = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [deviceToken]);
    return result.affectedRows > 0;
  }

  async insertEater(deviceToken: string): Promise<{ eaterCode: string; userTypeKeyWord: string } | null> {
    try {
      const userTypeKeyWord = USER_CONST.USER_TYPE.EATER.value;
      const sqlLast = `SELECT eaterCode FROM ${this.table} ORDER BY eaterCode DESC LIMIT 1`;
      const [[last]] = await this.db.execute<any[]>(sqlLast);

      let eaterCode = CODES.eaterCode.FRIST_CODE;
      if (last && last.eaterCode) {
        eaterCode = generateCode(last.eaterCode, CODES.eaterCode.PRE, CODES.eaterCode.LEN);
      }

      const sql = `INSERT INTO ${this.table} (eaterCode, deviceToken, userTypeKeyWord, entryTime, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW(), NOW())`;
      await this.db.execute<ResultSetHeader>(sql, [eaterCode, deviceToken, userTypeKeyWord]);

      return { eaterCode, userTypeKeyWord };
    } catch (error) {
      console.log('insertEater error: ', error);
      return null;
    }
  }
}

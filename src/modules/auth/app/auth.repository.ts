import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { IUserApp } from './auth.interface';
import { RegisterAppDto } from './auth.dto';
import { generateCode } from 'src/helpers/func';

@Injectable()
export class AuthAppRepository {
  private readonly table = 'tbl_user_app';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async findByPhone(userPhone: string): Promise<IUserApp | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT seq, userCode, userName, userPhone, userDevice, userPassword
     FROM ${this.table} WHERE userPhone = ? AND isActive = 'Y' LIMIT 1`,
      [userPhone],
    );
    return rows.length ? (rows[0] as IUserApp) : null;
  }
  async create(dto: RegisterAppDto): Promise<number> {
    const sqlLast = ` SELECT userCode FROM ${this.table} ORDER BY userCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let userCode = 'USR000001';
    if (rows.length > 0) {
      userCode = generateCode(rows[0].userCode, 'USR', 6);
    }
    const sql = `
      INSERT INTO ${this.table}  (userCode, userName, userPhone, userPassword, userDevice, createdId) 
      VALUES(?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, dto.userName, dto.userPhone, dto.userPassword, dto.userDevice, this.updator]);

    return result.insertId;
  }

  async updatePassword(newPassword: string, userPhone: string): Promise<number> {
    const sql = `
        UPDATE ${this.table} SET userPassword = ?, updatedAt = NOW(), updatedId = ?
        WHERE userPhone = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [newPassword, this.updator, userPhone]);

    return result.affectedRows;
  }
  async updateDeviceToken(userDevice: string, userPhone: string): Promise<number> {
    const sql = `
        UPDATE ${this.table} SET userDevice = ?, updatedAt = NOW(), updatedId = ?
        WHERE userPhone = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userDevice, this.updator, userPhone]);

    return result.affectedRows;
  }
}

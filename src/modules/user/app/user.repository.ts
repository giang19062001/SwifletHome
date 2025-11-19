import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { generateCode } from 'src/helpers/func';
import { RegisterAppDto } from 'src/modules/auth/app/auth.dto';
import { IUserApp, IUserAppInfo } from './user.interface';

@Injectable()
export class UserAppRepository {
  private readonly table = 'tbl_user_app';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async findByPhone(userPhone: string): Promise<IUserApp | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT seq, userCode, userName, userPhone, deviceToken, userPassword
     FROM ${this.table} WHERE userPhone = ? AND isActive = 'Y' LIMIT 1`,
      [userPhone],
    );
    return rows.length ? (rows[0] as IUserApp) : null;
  }
  async getDetail(userCode: string): Promise<IUserAppInfo | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, 
     B.startDate, B.endDate,  B.packageCode, IFNULL(C.packageName,'Gói dùng thử') AS packageName, IFNULL(C.packageDescription,'Gói dùng thử') AS packageDescription
     FROM ${this.table} A 
     LEFT JOIN tbl_user_payment B
     ON A.userCode = B.userCode
     LEFT JOIN tbl_package C
     ON B.packageCode = C.packageCode
     WHERE A.userCode = ? AND A.isActive = 'Y'
     LIMIT 1`,
      [userCode],
    );
    return rows.length ? (rows[0] as IUserAppInfo) : null;
  }
  async findBySeq(seq: number): Promise<IUserApp | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT seq, userCode, userName, userPhone, deviceToken, userPassword
     FROM ${this.table} WHERE seq = ? LIMIT 1`,
      [seq],
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
      INSERT INTO ${this.table}  (userCode, userName, userPhone, userPassword, deviceToken, isActive, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, dto.userName, dto.userPhone, dto.userPassword, dto.deviceToken, 'Y', this.updator]);

    return result.insertId;
  }
  async update(userName: string, userPhone: string, userCode: string): Promise<number> {
    const sql = `
        UPDATE ${this.table} SET userName = ?, updatedAt = NOW(), updatedId = ?
        WHERE userPhone = ? AND userCode = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userName, userCode, userPhone, userCode]);

    return result.affectedRows;
  }

  async updatePassword(newPassword: string, userPhone: string): Promise<number> {
    const sql = `
        UPDATE ${this.table} SET userPassword = ?, updatedAt = NOW(), updatedId = ?
        WHERE userPhone = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [newPassword, this.updator, userPhone]);

    return result.affectedRows;
  }
  async updateDeviceToken(deviceToken: string, userPhone: string): Promise<number> {
    const sql = `
        UPDATE ${this.table} SET deviceToken = ?, updatedAt = NOW(), updatedId = ?
        WHERE userPhone = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [deviceToken, this.updator, userPhone]);

    return result.affectedRows;
  }
}

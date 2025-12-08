import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { generateCode } from 'src/helpers/func.helper';
import { RegisterUserAppDto } from 'src/modules/auth/app/auth.dto';
import { IUserApp, IUserPackageApp } from './user.interface';
import { CreateUserPackageAppDto } from './user.dto';
import { ITokenUserApp } from 'src/modules/auth/app/auth.interface';
import { CODES } from 'src/helpers/const.helper';

@Injectable()
export class UserAppRepository {
  private readonly table = 'tbl_user_app';
  private readonly tablePackage = 'tbl_user_package';
  private readonly tablePackageHistory = 'tbl_user_package_history';
  private readonly tableHome = 'tbl_user_home';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async findByPhone(userPhone: string): Promise<ITokenUserApp | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT seq, userCode, userName, userPhone, deviceToken, userPassword
     FROM ${this.table} WHERE userPhone = ? AND isActive = 'Y' LIMIT 1`,
      [userPhone],
    );
    return rows.length ? (rows[0] as ITokenUserApp) : null;
  }
  async getUserPackageInfo(userCode: string): Promise<IUserPackageApp | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT  A.userCode, B.startDate, B.endDate,  B.packageCode, IFNULL(C.packageName,'Gói dùng thử') AS packageName, IFNULL(C.packageDescription,'') AS packageDescription,
      IF(B.endDate IS NOT NULL, DATEDIFF(B.endDate, CURDATE()), 0) AS packageRemainDay
      FROM ${this.table} A 
      LEFT JOIN ${this.tablePackage} B
        ON A.userCode = B.userCode
      LEFT JOIN tbl_package C
        ON B.packageCode = C.packageCode
      WHERE A.userCode = ? AND A.isActive = 'Y' 
       LIMIT 1`,
      [userCode],
    );
    return rows.length ? (rows[0] as IUserPackageApp) : null;
  }
  async getInfo(userCode: string): Promise<IUserApp | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken,
      B.packageCode, IFNULL(C.packageName,'Gói dùng thử') AS packageName, IFNULL(C.packageDescription,'') AS packageDescription,
      IF(B.endDate IS NOT NULL, DATEDIFF(B.endDate, CURDATE()), 0) AS packageRemainDay,  B.startDate, B.endDate,  
      COUNT(D.seq) AS homesTotal
      FROM ${this.table} A 
      LEFT JOIN ${this.tablePackage} B
        ON A.userCode = B.userCode
      LEFT JOIN tbl_package C
        ON B.packageCode = C.packageCode
      LEFT JOIN ${this.tableHome} D
        ON D.userCode = A.userCode AND D.isActive = 'Y' 
      WHERE A.userCode = ? AND A.isActive = 'Y' 
      GROUP BY 
      A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken,
      B.startDate, B.endDate, B.packageCode,
      C.packageName, C.packageDescription
       LIMIT 1`,
      [userCode],
    );
    return rows.length ? (rows[0] as IUserApp) : null;
  }
  async findBySeq(seq: number): Promise<ITokenUserApp | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT seq, userCode, userName, userPhone, deviceToken, userPassword
     FROM ${this.table} WHERE seq = ? LIMIT 1`,
      [seq],
    );
    return rows.length ? (rows[0] as ITokenUserApp) : null;
  }
  async create(dto: RegisterUserAppDto): Promise<number> {
    const sqlLast = ` SELECT userCode FROM ${this.table} ORDER BY userCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let userCode = CODES.userCode.FRIST_CODE;
    if (rows.length > 0) {
      userCode = generateCode(rows[0].userCode, CODES.userCode.PRE, 6);
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

  // TODO: PACKAGE
  async writePackageHistory(dto: CreateUserPackageAppDto, createdAt: Date): Promise<number> {
    const sql = `
          INSERT INTO ${this.tablePackageHistory} (userCode, packageCode, startDate, endDate, createdId, createdAt) 
          VALUES(?, ?, ?, ?, ?, ?)
        `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.userCode, dto.packageCode, dto.startDate, dto.endDate, this.updator, createdAt]);

    return result.insertId;
  }
  async createPackage(dto: CreateUserPackageAppDto, createdAt: Date): Promise<number> {
    const sql = `
          INSERT INTO ${this.tablePackage} (userCode, packageCode, startDate, endDate, isActive, createdId, createdAt) 
          VALUES(?, ?, ?, ?, ?, ?, ?)
        `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.userCode, dto.packageCode, dto.startDate, dto.endDate, 'Y', this.updator, createdAt]);

    return result.insertId;
  }


}

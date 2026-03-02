import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { generateCode } from 'src/helpers/func.helper';
import { RegisterUserAppDto } from 'src/modules/auth/app/auth.dto';
import { IUserApp, IUserPackageApp, USER_CONST } from './user.interface';
import { CreateUserPackageAppDto } from './user.dto';
import { ITokenUserApp, ITokenUserAppWithPassword } from 'src/modules/auth/app/auth.interface';
import { CODES, UPDATOR } from 'src/helpers/const.helper';
import { TEXTS } from 'src/helpers/text.helper';
import { UserTypeResDto } from './user.response';

@Injectable()
export class UserAppRepository {
  private readonly table = 'tbl_user_app';
  private readonly tableDel = 'tbl_user_app_delete';
  private readonly tablePackage = 'tbl_user_package';
  private readonly tableType = 'tbl_user_type';
  private readonly tablePackageHistory = 'tbl_user_package_history';
  private readonly tableHome = 'tbl_user_home';
  private readonly tableTeam = 'tbl_team_user';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getAllUserCode(): Promise<ITokenUserApp[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT seq, userCode FROM ${this.table} WHERE isActive = 'Y' `, []);

    return rows as ITokenUserApp[];
  }
  async findByPhoneWithoutCountry(userPhone: string): Promise<ITokenUserAppWithPassword | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken, A.userTypeCode, B.userTypeKeyWord, A.userPassword, A.countryCode
     FROM ${this.table} A
     LEFT JOIN ${this.tableType} B
     ON A.userTypeCode = B.userTypeCode
     WHERE A.userPhone = ? AND A.isActive = 'Y' LIMIT 1`,
      [userPhone],
    );
    return rows.length ? (rows[0] as ITokenUserAppWithPassword) : null;
  }
  async findByPhone(userPhone: string, countryCode: string): Promise<ITokenUserAppWithPassword | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken, A.userTypeCode, B.userTypeKeyWord, A.userPassword, A.countryCode
     FROM ${this.table} A
     LEFT JOIN ${this.tableType} B
     ON A.userTypeCode = B.userTypeCode
     WHERE A.userPhone = ? AND A.countryCode = ? AND A.isActive = 'Y' LIMIT 1`,
      [userPhone, countryCode],
    );
    return rows.length ? (rows[0] as ITokenUserAppWithPassword) : null;
  }
  async findBySeq(seq: number): Promise<ITokenUserAppWithPassword | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken, A.userTypeCode, B.userTypeKeyWord, A.userPassword, A.countryCode
    FROM ${this.table} A
    LEFT JOIN ${this.tableType} B
    ON A.userTypeCode = B.userTypeCode
      WHERE A.seq = ? LIMIT 1`,
      [seq],
    );
    return rows.length ? (rows[0] as ITokenUserAppWithPassword) : null;
  }
  async findByCode(userCode: string): Promise<ITokenUserAppWithPassword | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken, A.userTypeCode, B.userTypeKeyWord, A.userPassword, A.countryCode
      FROM ${this.table} A
      LEFT JOIN ${this.tableType} B
      ON A.userTypeCode = B.userTypeCode
        WHERE A.userCode = ? LIMIT 1`,
      [userCode],
    );
    return rows.length ? (rows[0] as ITokenUserAppWithPassword) : null;
  }
  async getUserPackageInfo(userCode: string): Promise<IUserPackageApp | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT  A.userCode, B.startDate, B.endDate,  B.packageCode, IFNULL(C.packageName,'${TEXTS.PACKAGE_FREE}') AS packageName, IFNULL(C.packageDescription,'') AS packageDescription,
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
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken, A.countryCode,
      B.packageCode, IFNULL(C.packageName,'${TEXTS.PACKAGE_FREE}') AS packageName, IFNULL(C.packageDescription,'') AS packageDescription,
      IF(B.endDate IS NOT NULL, DATEDIFF(B.endDate, CURDATE()), 0) AS packageRemainDay,  B.startDate, B.endDate,  
      COUNT(D.seq) AS homesTotal, E.userTypeCode, E.userTypeKeyWord, E.userTypeName
      FROM ${this.table} A 
      LEFT JOIN ${this.tablePackage} B
        ON A.userCode = B.userCode
      LEFT JOIN tbl_package C
        ON B.packageCode = C.packageCode
      LEFT JOIN ${this.tableHome} D
        ON D.userCode = A.userCode AND D.isActive = 'Y' 
      LEFT JOIN ${this.tableType} E
        ON A.userTypeCode = E.userTypeCode
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

  async create(dto: RegisterUserAppDto): Promise<number> {
    try {
      const sqlLastMain = ` SELECT userCode FROM ${this.table} ORDER BY userCode DESC LIMIT 1`;
      const sqlLastDel = ` SELECT userCode FROM ${this.tableDel} ORDER BY userCode DESC LIMIT 1`;

      const [[lastMain]] = await this.db.execute<any[]>(sqlLastMain);
      const [[lastDel]] = await this.db.execute<any[]>(sqlLastDel);

      let baseCode = CODES.userCode.FRIST_CODE;

      if (lastMain && lastDel) {
        baseCode = lastMain.userCode > lastDel.userCode ? lastMain.userCode : lastDel.userCode;
      } else if (lastMain) {
        baseCode = lastMain.userCode;
      } else if (lastDel) {
        baseCode = lastDel.userCode;
      }

      const userCode = generateCode(baseCode, CODES.userCode.PRE, 6);

      const sql = `
      INSERT INTO ${this.table}  (userCode, userName, userPhone, userPassword, userTypeCode, countryCode, deviceToken, isActive, createdId)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
      const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, dto.userName, dto.userPhone, dto.userPassword, dto.userTypeCode, dto.countryCode, dto.deviceToken, 'Y', UPDATOR]);

      return result.insertId;
    } catch (error) {
      console.log('create --', error);
      return 0;
    }
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
    const [result] = await this.db.execute<ResultSetHeader>(sql, [newPassword, UPDATOR, userPhone]);

    return result.affectedRows;
  }
  async updateDeviceToken(deviceToken: string, userPhone: string): Promise<number> {
    const sql = `
        UPDATE ${this.table} SET deviceToken = ?, updatedAt = NOW(), updatedId = ?
        WHERE userPhone = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [deviceToken, UPDATOR, userPhone]);

    return result.affectedRows;
  }

  async deleteAccount(userCode: string, user: ITokenUserAppWithPassword): Promise<number> {
    const conn = await this.db.getConnection();
    try {
      await conn.beginTransaction();

      // Insert vào bảng delete
      await conn.query(
        ` INSERT INTO ${this.tableDel} (userCode, userName, userPassword, userPhone, deviceToken)
          VALUES (?, ?, ?, ?, ?) `,
        [user.userCode, user.userName, user.userPassword, user.userPhone, user.deviceToken],
      );
      // Delete khỏi bảng chính
      const [deleteResult]: any = await conn.query(` DELETE FROM ${this.table} WHERE userCode = ? LIMIT 1`, [userCode]);
      if (deleteResult.affectedRows !== 1) {
        return 0;
      }

      await conn.commit();
      return 1;
    } catch (err) {
      console.log('deleteAccount --- err: ', err);
      await conn.rollback();
      return 0;
    } finally {
      conn.release();
    }
  }

  // TODO: PACKAGE
  async writePackageHistory(dto: CreateUserPackageAppDto, createdAt: Date): Promise<number> {
    const sql = `
          INSERT INTO ${this.tablePackageHistory} (userCode, packageCode, startDate, endDate, createdId, createdAt) 
          VALUES(?, ?, ?, ?, ?, ?)
        `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.userCode, dto.packageCode, dto.startDate, dto.endDate, UPDATOR, createdAt]);

    return result.insertId;
  }
  async createPackage(dto: CreateUserPackageAppDto, createdAt: Date): Promise<number> {
    const sql = `
          INSERT INTO ${this.tablePackage} (userCode, packageCode, startDate, endDate, isActive, createdId, createdAt) 
          VALUES(?, ?, ?, ?, ?, ?, ?)
        `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.userCode, dto.packageCode, dto.startDate, dto.endDate, 'Y', UPDATOR, createdAt]);

    return result.insertId;
  }

  // TODO: TYPE
  async getAllUserType(): Promise<UserTypeResDto[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT userTypeCode, userTypeKeyWord, userTypeName
       FROM ${this.tableType} WHERE isActive = 'Y' `,
      [],
    );
    return rows as UserTypeResDto[];
  }
  async getOneUserType(userTypeCode: string): Promise<UserTypeResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT userTypeCode, userTypeKeyWord, userTypeName
       FROM ${this.tableType} WHERE isActive = 'Y' AND  userTypeCode = ? `,
      [userTypeCode],
    );
    return rows.length ? (rows[0] as UserTypeResDto) : null;
  }
  async getOneUserTypeByKeyword(userTypeKeyWord: string): Promise<UserTypeResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT userTypeCode, userTypeKeyWord, userTypeName
       FROM ${this.tableType} WHERE isActive = 'Y' AND  userTypeKeyWord = ? `,
      [userTypeKeyWord],
    );
    return rows.length ? (rows[0] as UserTypeResDto) : null;
  }

  async getAllowTypesOfUser(userCode: string): Promise<UserTypeResDto[]> {
    const sql = ` SELECT userTypeCode, userTypeKeyWord, userTypeName
       FROM ${this.tableType} WHERE isActive = 'Y' 
       AND (userTypeKeyWord = '${USER_CONST.USER_TYPE.OWNER.value}'  OR  userTypeKeyWord = '${USER_CONST.USER_TYPE.PURCHASER.value}')
       UNION ALL
       SELECT A.userTypeCode, A.userTypeKeyWord, A.userTypeName
       FROM ${this.tableType} A
       JOIN ${this.tableTeam} B
       ON A.userTypeCode = B.userTypeCode
       WHERE A.isActive = 'Y' 
       AND (A.userTypeKeyWord = '${USER_CONST.USER_TYPE.FACTORY.value}'  OR  A.userTypeKeyWord = '${USER_CONST.USER_TYPE.TECHNICAL.value}')
       AND B.userCode = ? `;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, [userCode]);
    return rows as UserTypeResDto[];
  }
}

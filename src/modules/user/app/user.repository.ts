import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { CODES, UPDATOR } from 'src/helpers/const.helper';
import { generateCode } from 'src/helpers/func.helper';
import { TEXTS } from 'src/helpers/text.helper';
import { YnEnum } from 'src/interfaces/admin.interface';
import { RegisterUserAppDto } from 'src/modules/auth/app/auth.dto';
import { TokenUserAppResDto, TokenUserAppWithPasswordResDto } from '../../auth/app/auth.response';
import { USER_CONST } from './user.const';
import { CreateUserPackageAppDto } from './user.dto';
import { AllowUserTypeResDto, GetInfoUserAppResDto, UserPackageAppResDto, UserTypeResDto } from './user.response';

@Injectable()
export class UserAppRepository {
  private readonly table = 'tbl_user_app';
  private readonly tableDel = 'tbl_user_app_delete';
  private readonly tableUserPackage = 'tbl_user_package';
  private readonly tableType = 'tbl_user_type';
  private readonly tableUserPackageHistory = 'tbl_user_package_history';
  private readonly tableHome = 'tbl_user_home';
  private readonly tableTeam = 'tbl_team_user';
  private readonly tablePackage = 'tbl_package';
  private readonly tablePhoneCode = 'tbl_phone_code';
  private readonly tableUserTypeLive = 'tbl_user_type_live';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getAllUserCode(): Promise<TokenUserAppResDto[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT seq, userCode FROM ${this.table} WHERE isActive = 'Y' `, []);

    return rows as TokenUserAppResDto[];
  }
  async findByPhoneWithoutCountry(userPhone: string): Promise<TokenUserAppWithPasswordResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken, A.userTypeCode, B.userTypeKeyWord, A.userPassword, A.countryCode, C.languageCode
     FROM ${this.table} A
     LEFT JOIN ${this.tableType} B ON A.userTypeCode = B.userTypeCode
     LEFT JOIN ${this.tablePhoneCode} C ON A.countryCode = C.countryCode
     WHERE A.userPhone = ? AND A.isActive = 'Y' LIMIT 1`,
      [userPhone],
    );
    return rows.length ? (rows[0] as TokenUserAppWithPasswordResDto) : null;
  }
  async findByPhone(userPhone: string, countryCode: string): Promise<TokenUserAppWithPasswordResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken, A.userTypeCode, B.userTypeKeyWord, A.userPassword, A.countryCode, C.languageCode
     FROM ${this.table} A
     LEFT JOIN ${this.tableType} B ON A.userTypeCode = B.userTypeCode
     LEFT JOIN ${this.tablePhoneCode} C ON A.countryCode = C.countryCode
     WHERE A.userPhone = ? AND A.countryCode = ? AND A.isActive = 'Y' LIMIT 1`,
      [userPhone, countryCode],
    );
    return rows.length ? (rows[0] as TokenUserAppWithPasswordResDto) : null;
  }
  async findBySeq(seq: number): Promise<TokenUserAppWithPasswordResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken, A.userTypeCode, B.userTypeKeyWord, A.userPassword, A.countryCode, C.languageCode
     FROM ${this.table} A
     LEFT JOIN ${this.tableType} B ON A.userTypeCode = B.userTypeCode
     LEFT JOIN ${this.tablePhoneCode} C ON A.countryCode = C.countryCode
       WHERE A.seq = ? LIMIT 1`,
      [seq],
    );
    return rows.length ? (rows[0] as TokenUserAppWithPasswordResDto) : null;
  }
  async findByCode(userCode: string): Promise<TokenUserAppWithPasswordResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken, A.userTypeCode, B.userTypeKeyWord, A.userPassword, A.countryCode, C.languageCode
      FROM ${this.table} A
      LEFT JOIN ${this.tableType} B ON A.userTypeCode = B.userTypeCode
      LEFT JOIN ${this.tablePhoneCode} C ON A.countryCode = C.countryCode
        WHERE A.userCode = ? LIMIT 1`,
      [userCode],
    );
    return rows.length ? (rows[0] as TokenUserAppWithPasswordResDto) : null;
  }

  async findByDeviceToken(deviceToken: string): Promise<TokenUserAppWithPasswordResDto | null> {
    if (!deviceToken || deviceToken === '') return null;
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken, A.userTypeCode, B.userTypeKeyWord, A.userPassword, A.countryCode, C.languageCode
      FROM ${this.table} A
      LEFT JOIN ${this.tableType} B ON A.userTypeCode = B.userTypeCode
      LEFT JOIN ${this.tablePhoneCode} C ON A.countryCode = C.countryCode
        WHERE A.deviceToken = ? AND A.isActive = 'Y' LIMIT 1`,
      [deviceToken],
    );
    return rows.length ? (rows[0] as TokenUserAppWithPasswordResDto) : null;
  }

  async getUserPackageInfo(userCode: string): Promise<UserPackageAppResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT  A.userCode, B.startDate, B.endDate,  B.packageCode, IFNULL(C.packageName,'${TEXTS.PACKAGE_FREE}') AS packageName, IFNULL(C.packageDescription,'') AS packageDescription,
      IF(B.endDate IS NOT NULL, GREATEST(0, CEIL(TIMESTAMPDIFF(SECOND, NOW(), B.endDate) / 86400)), 0) AS packageRemainDay
      FROM ${this.table} A 
      LEFT JOIN ${this.tableUserPackage} B
        ON A.userCode = B.userCode
      LEFT JOIN ${this.tablePackage} C
        ON B.packageCode = C.packageCode
      WHERE A.userCode = ? AND A.isActive = 'Y' 
       LIMIT 1`,
      [userCode],
    );
    return rows.length ? (rows[0] as UserPackageAppResDto) : null;
  }
  async getInfo(userCode: string): Promise<GetInfoUserAppResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken, A.countryCode, F.languageCode,
      B.packageCode, IFNULL(C.packageName,'${TEXTS.PACKAGE_FREE}') AS packageName, IFNULL(C.packageDescription,'') AS packageDescription,
      IF(B.endDate IS NOT NULL, GREATEST(0, CEIL(TIMESTAMPDIFF(SECOND, NOW(), B.endDate) / 86400)), 0) AS packageRemainDay,  B.startDate, B.endDate,  
      COUNT(D.seq) AS homesTotal, E.userTypeCode, E.userTypeKeyWord, E.userTypeName
      FROM ${this.table} A 
      LEFT JOIN ${this.tableUserPackage} B
        ON A.userCode = B.userCode
      LEFT JOIN ${this.tablePackage} C
        ON B.packageCode = C.packageCode
      LEFT JOIN ${this.tableHome} D
        ON D.userCode = A.userCode AND D.isActive = 'Y' 
      LEFT JOIN ${this.tableType} E
        ON A.userTypeCode = E.userTypeCode
      LEFT JOIN ${this.tablePhoneCode} F
        ON A.countryCode = F.countryCode
      WHERE A.userCode = ? AND A.isActive = 'Y' 
      GROUP BY 
      A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken, A.countryCode, F.languageCode,
      B.startDate, B.endDate, B.packageCode,
      C.packageName, C.packageDescription
       LIMIT 1`,
      [userCode],
    );
    return rows.length ? (rows[0] as GetInfoUserAppResDto) : null;
  }

  async register(dto: RegisterUserAppDto): Promise<number> {
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
      const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, dto.userName, dto.userPhone, dto.userPassword, dto.userTypeCode, dto.countryCode, '', 'Y', UPDATOR]);

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

  async clearDeviceToken(deviceToken: string): Promise<number> {
    if (!deviceToken || deviceToken === '') return 0;
    const sql = `
        UPDATE ${this.table} SET deviceToken = '', updatedAt = NOW(), updatedId = ?
        WHERE deviceToken = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [UPDATOR, deviceToken]);
    return result.affectedRows;
  }

  async deleteAccount(userCode: string, user: TokenUserAppWithPasswordResDto): Promise<number> {
    const conn = await this.db.getConnection();
    try {
      await conn.beginTransaction();

      // Lưu lịch sử user bị xóa
      await conn.query(
        ` INSERT INTO ${this.tableDel} (userCode, userName, userPassword, userPhone, countryCode, deviceToken)
          VALUES (?, ?, ?, ?, ?, ?) `,
        [(user as any).userCode, user.userName, user.userPassword, user.userPhone, (user as any).countryCode, (user as any).deviceToken],
      );

      // User Package
      // await conn.query(`UPDATE tbl_user_package SET packageCode = NULL, startDate = NULL, endDate = NULL, checkout_seq = NULL, isActive = 'N', updatedAt = NOW() WHERE userCode = ?`, [userCode]);

      // Xóa user khỏi bảng chính
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
          INSERT INTO ${this.tableUserPackageHistory} (userCode, packageCode, startDate, endDate, createdId, createdAt) 
          VALUES(?, ?, ?, ?, ?, ?)
        `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.userCode, dto.packageCode, dto.startDate, dto.endDate, UPDATOR, createdAt]);

    return result.insertId;
  }
  async createPackage(dto: CreateUserPackageAppDto, createdAt: Date): Promise<number> {
    const sql = `
          INSERT INTO ${this.tableUserPackage} (userCode, packageCode, startDate, endDate, isActive, createdId, createdAt) 
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

  async getAllowTypesOfUser(userCode: string): Promise<AllowUserTypeResDto[]> {
    const sql = ` SELECT 
                A.userTypeCode, 
                A.userTypeKeyWord, 
                A.userTypeName,
                B.teamCode,
                IF(
                    A.userTypeKeyWord IN ('${USER_CONST.USER_TYPE.OWNER.value}', '${USER_CONST.USER_TYPE.PURCHASER.value}', '${USER_CONST.USER_TYPE.EATER.value}')
                    OR (
                        A.userTypeKeyWord IN ('${USER_CONST.USER_TYPE.FACTORY.value}', '${USER_CONST.USER_TYPE.TECHNICAL.value}')
                        AND EXISTS (
                            SELECT 1
                            FROM ${this.tableTeam} B
                            WHERE B.userTypeCode = A.userTypeCode
                              AND B.userCode = ?
                        )
                    ),'Y','N'
                ) AS isSetted
            FROM ${this.tableType} A
            LEFT JOIN  ${this.tableTeam} B
            ON B.userTypeCode = A.userTypeCode AND B.userCode = ?
            WHERE A.isActive = 'Y' `;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, [userCode, userCode]);
    return rows as AllowUserTypeResDto[];
  }

  async checkAllowTypeOfUser(userCode: string, userTypeKeyWord: string): Promise<{ isSetted: YnEnum } | null> {
    const sql = `  SELECT IF(COUNT(teamCode) > 0, 'Y', 'N') as isSetted
          FROM ${this.tableTeam} A
          LEFT JOIN ${this.tableType} B
          ON B.userTypeCode = A.userTypeCode
          WHERE B.userTypeKeyWord = ?
            AND A.userCode = ? `;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, [userTypeKeyWord, userCode]);
    return rows.length ? (rows[0] as { isSetted: YnEnum }) : null;
  }

  async upsertUserTypeLive(userCode: string, userTypeCode: string): Promise<number> {
    const sql = `
        INSERT INTO ${this.tableUserTypeLive} (userCode, userTypeCode, updatedAt)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE userTypeCode = VALUES(userTypeCode), updatedAt = NOW()
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, userTypeCode]);
    return result.affectedRows;
  }
}

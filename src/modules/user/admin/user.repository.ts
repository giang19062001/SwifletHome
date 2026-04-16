import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { UPDATOR } from 'src/helpers/const.helper';
import { TEXTS } from 'src/helpers/text.helper';
import { TokenUserAdminResDto } from "../../auth/admin/auth.dto";
import { UserAppResDto } from "../app/user.dto";
import { USER_CONST } from "../app/user.interface";
import { GetAllUserDto, GetUsersForTeamByTypeDto, UpdateUserPackageAdminDto, UserForTeamByTypeResDto, UserPackageFilterEnum, UserTypeResDto } from './user.dto';

@Injectable()
export class UserAdminRepository {
  private readonly tableAdmin = 'tbl_user_admin';
  private readonly tableApp = 'tbl_user_app';
  private readonly tablePackage = 'tbl_user_package';
  private readonly tablePackageHistory = 'tbl_user_package_history';
  private readonly tableType = 'tbl_user_type';
  private readonly tableTeam = 'tbl_team_user';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async findByUserId(userId: string): Promise<TokenUserAdminResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT seq, userId, userPassword, userName, isActive FROM ${this.tableAdmin} WHERE userId = ? LIMIT 1`, [userId]);
    return rows.length ? (rows[0] as TokenUserAdminResDto) : null;
  }

  async getDeviceTokensByUsers(userCodesMuticast: string[]): Promise<{ userCode: string; deviceToken: string }[]> {
    if (!userCodesMuticast || userCodesMuticast.length === 0) {
      return [];
    }

    const placeholders = userCodesMuticast.map(() => '?').join(', ');
    const query = ` SELECT userCode, deviceToken
          FROM tbl_user_app
          WHERE userCode IN (${placeholders})
            AND isActive = 'Y'
            AND deviceToken IS NOT NULL 
            AND deviceToken != '';`;
    const [rows] = await this.db.query<RowDataPacket[]>(query, userCodesMuticast);
    return rows as { userCode: string; deviceToken: string }[];
  }

  async getTotalUserApp(dto: GetAllUserDto): Promise<number> {
    let query = ` SELECT COUNT(A.seq) AS TOTAL 
     FROM ${this.tableApp} A 
     LEFT JOIN ${this.tablePackage} B ON A.userCode = B.userCode
     WHERE A.isActive = 'Y' 
    `;
    const params: any[] = [];
    if (dto.userName) {
      query += ` AND A.userName LIKE ?`;
      params.push(`%${dto.userName}%`);
    }

    if (dto.userPhone) {
      query += ` AND A.userPhone LIKE ?`;
      params.push(`%${dto.userPhone}%`);
    }

    if (dto.userPackageFilter == UserPackageFilterEnum.FREE) {
      query += ` AND B.packageCode IS NULL `;
    } else if (dto.userPackageFilter == UserPackageFilterEnum.PAY) {
      query += ` AND B.packageCode IS NOT NULL `;
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }

  async getAllUserApp(dto: GetAllUserDto): Promise<UserAppResDto[]> {
    try {
      let query = ` SELECT A.seq, A.userCode, A.userName, A.userPhone,  A.deviceToken, A.createdAt, A.updatedAt,
     B.startDate, B.endDate,  B.packageCode, IFNULL(C.packageName,'${TEXTS.PACKAGE_FREE}') AS packageName, IFNULL(C.packageDescription,'') AS packageDescription,
     IF(B.endDate IS NOT NULL, DATEDIFF(B.endDate, CURDATE()), 0) AS packageRemainDay,
     CASE WHEN B.checkout_seq IS NOT NULL THEN (SELECT store FROM tbl_checkout WHERE seq = B.checkout_seq LIMIT 1) ELSE 'ADMIN' END AS paymentMethod
     FROM ${this.tableApp} A 
     LEFT JOIN ${this.tablePackage} B
     ON A.userCode = B.userCode
     LEFT JOIN tbl_package C
     ON B.packageCode = C.packageCode
     WHERE A.isActive = 'Y' 
     `;
      const params: any[] = [];
      if (dto.userName) {
        query += ` AND A.userName LIKE ?`;
        params.push(`%${dto.userName}%`);
      }

      if (dto.userPhone) {
        query += ` AND A.userPhone LIKE ?`;
        params.push(`%${dto.userPhone}%`);
      }

      if (dto.userPackageFilter == UserPackageFilterEnum.FREE) {
        query += ` AND B.packageCode IS NULL `;
      } else if (dto.userPackageFilter == UserPackageFilterEnum.PAY) {
        query += ` AND B.packageCode IS NOT NULL `;
      }

      query += `  ORDER BY A.createdAt DESC `;

      if (dto.limit > 0 && dto.page > 0) {
        query += ` LIMIT ? OFFSET ?`;
        params.push(dto.limit, (dto.page - 1) * dto.limit);
      }

      const [rows] = await this.db.query<RowDataPacket[]>(query, params);
      return rows as UserAppResDto[];
    } catch (error) {
      console.log('error', error);
      return [];
    }
  }
  async getDetailUserApp(userCode: string): Promise<UserAppResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.deviceToken, A.createdAt, A.updatedAt,
     B.startDate, B.endDate,  B.packageCode, IFNULL(C.packageName,'${TEXTS.PACKAGE_FREE}') AS packageName, IFNULL(C.packageDescription,'') AS packageDescription,
     IF(B.endDate IS NOT NULL, DATEDIFF(B.endDate, CURDATE()), 0) AS packageRemainDay,
     CASE WHEN B.checkout_seq IS NOT NULL THEN (SELECT store FROM tbl_checkout WHERE seq = B.checkout_seq LIMIT 1) ELSE 'ADMIN' END AS paymentMethod
     FROM ${this.tableApp} A 
     LEFT JOIN ${this.tablePackage} B
     ON A.userCode = B.userCode
     LEFT JOIN tbl_package C
     ON B.packageCode = C.packageCode
     WHERE A.userCode = ? AND A.isActive = 'Y'
     LIMIT 1`,
      [userCode],
    );
    return rows.length ? (rows[0] as UserAppResDto) : null;
  }

  //TODO:PACKAGE
  async writePackageHistory(dto: UpdateUserPackageAdminDto, userCode: string, startDate: string | null, endDate: string | null, createdAt: Date): Promise<number> {
    const sql = `
        INSERT INTO ${this.tablePackageHistory} (userCode, packageCode, startDate, endDate, createdId, createdAt, checkout_seq) 
        VALUES(?, ?, ?, ?, ?, ?, NULL)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, dto.packageCode == '' ? null : dto.packageCode, startDate, endDate, UPDATOR, createdAt]);

    return result.insertId;
  }
  async isFristTimesUpdatePackage(userCode: string): Promise<Boolean> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` 
      SELECT seq FROM ${this.tablePackage} 
      WHERE userCode = ? AND updatedAt IS NOT NULL
      AND  updatedId IS NOT NULL
      LIMIT 1`,
      [userCode],
    );
    return rows[0] == null ? true : false; // NẾU NULL -> LẦN ĐẦU, NẾU CÓ -> ĐÃ UPDATE NHIEU LẦN
  }

  async updatePackage(dto: UpdateUserPackageAdminDto, userCode: string, startDate: string | null, endDate: string | null, updatedId: string, updatedAt: Date): Promise<number> {
    const sql = `
        UPDATE ${this.tablePackage} SET packageCode = ?, startDate = ?, endDate = ?, updatedId = ?, updatedAt = ?, checkout_seq = NULL
        WHERE userCode = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.packageCode == '' ? null : dto.packageCode, startDate, endDate, updatedId, updatedAt, userCode]);
    return result.affectedRows;
  }

  // TODO: TYPE
  async getTypesForTeam(): Promise<UserTypeResDto[]> {
    const sql = ` SELECT userTypeCode, userTypeKeyWord, userTypeName
         FROM ${this.tableType} WHERE isActive = 'Y' 
         AND userTypeKeyWord != '${USER_CONST.USER_TYPE.OWNER.value}'  AND  userTypeKeyWord != '${USER_CONST.USER_TYPE.PURCHASER.value}' `;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, []);
    return rows as UserTypeResDto[];
  }
  async getUsersForTeamByType(dto: GetUsersForTeamByTypeDto): Promise<UserForTeamByTypeResDto[]> {
    const sql = ` SELECT A.userCode, A.userName, A.userPhone
         FROM ${this.tableApp} A
         WHERE A.isActive = 'Y' 
         ${dto.pageType === "create" ? ` AND A.userCode NOT IN ( SELECT B.userCode FROM ${this.tableTeam} B WHERE B.userTypeCode = '${dto.userTypeCode}' )` : ""}
      `;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, []);
    return rows as UserForTeamByTypeResDto[];
  }
}

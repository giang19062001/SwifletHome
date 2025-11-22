import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { IUserAdmin } from './user.interface';
import { PagingDto } from 'src/dto/admin.dto';
import { IUserAppInfo } from '../app/user.interface';
import { UpdateUserPackageAdminDto } from './user.dto';

@Injectable()
export class UserAdminRepository {
  private readonly tableAdmin = 'tbl_user_admin';
  private readonly tableApp = 'tbl_user_app';
  private readonly tablePackage = 'tbl_user_package';
  private readonly tablePackageHistory = 'tbl_user_package_history';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async findByUserId(userId: string): Promise<IUserAdmin | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT seq, userId, userPassword, userName, isActive FROM ${this.tableAdmin} WHERE userId = ? LIMIT 1`, [userId]);
    return rows.length ? (rows[0] as IUserAdmin) : null;
  }

  async getTotalUserApp(dto: PagingDto): Promise<number> {
    let query = ` SELECT COUNT(seq) AS TOTAL  FROM ${this.tableApp}  `;
    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }

  async getAllUserApp(dto: PagingDto): Promise<IUserAppInfo[]> {
    let query = ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.createdAt, A.updatedAt,
     B.startDate, B.endDate,  B.packageCode, IFNULL(C.packageName,'Gói dùng thử') AS packageName, IFNULL(C.packageDescription,'') AS packageDescription
     FROM ${this.tableApp} A 
     LEFT JOIN tbl_user_package B
     ON A.userCode = B.userCode
     LEFT JOIN tbl_package C
     ON B.packageCode = C.packageCode
     WHERE A.isActive = 'Y' `;
    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IUserAppInfo[];
  }
  async getDetailUserApp(userCode: string): Promise<IUserAppInfo | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.createdAt, A.updatedAt,
     B.startDate, B.endDate,  B.packageCode, IFNULL(C.packageName,'Gói dùng thử') AS packageName, IFNULL(C.packageDescription,'') AS packageDescription
     FROM ${this.tableApp} A 
     LEFT JOIN tbl_user_package B
     ON A.userCode = B.userCode
     LEFT JOIN tbl_package C
     ON B.packageCode = C.packageCode
     WHERE A.userCode = ? AND A.isActive = 'Y'
     LIMIT 1`,
      [userCode],
    );
    return rows.length ? (rows[0] as IUserAppInfo) : null;
  }

  //TODO:PACKAGE
  async writePackageHistory(dto: UpdateUserPackageAdminDto, userCode: string, startDate: string | null, endDate: string | null, createdAt: Date): Promise<number> {
    const sql = `
        INSERT INTO ${this.tablePackageHistory} (userCode, packageCode, startDate, endDate, createdId, createdAt) 
        VALUES(?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, dto.packageCode == '' ? null : dto.packageCode, startDate, endDate, this.updator, createdAt]);

    return result.insertId;
  }
  async updatePackage(dto: UpdateUserPackageAdminDto, userCode: string, startDate: string | null, endDate: string | null, updatedAt: Date): Promise<number> {
    const sql = `
        UPDATE  ${this.tablePackage} SET packageCode = ?, startDate = ?, endDate = ?, updatedId = ?, updatedAt = ?
        WHERE userCode = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.packageCode == '' ? null : dto.packageCode, startDate, endDate, dto.updatedId, updatedAt, userCode]);

    return result.affectedRows;
  }


}

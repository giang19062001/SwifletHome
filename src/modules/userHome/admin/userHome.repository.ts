import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IUserHome } from '../userHome.interface';
import { GetHomesAdminDto, TriggerUserHomeSensorDto } from './userHome.dto';
import { YnEnum } from 'src/interfaces/admin.interface';
import { IUserHomeSensor } from './userhome.interface';
@Injectable()
export class UserHomeAdminRepository {
  private readonly table = 'tbl_user_home';
  private readonly tableUser = 'tbl_user_app';
  private readonly tableImg = 'tbl_user_home_img';
  private readonly tableSensor = 'tbl_user_home_sensor';

  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getTotal(userCode: string): Promise<number> {
    let query = ` SELECT COUNT(seq) AS TOTAL FROM ${this.table} WHERE 1 = 1 `;
    const params: any[] = [];
    if (userCode) {
      query += ' AND  userCode = ? ';
      params.push(userCode);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: GetHomesAdminDto): Promise<IUserHome[]> {
    let query = ` SELECT A.seq, A.userCode, B.userName, B.userPhone, A.userHomeCode, A.userHomeName, A.userHomeAddress, 
    C.provinceName AS userHomeProvince, A.userHomeDescription, A.userHomeImage,
    A.isIntegateTempHum, A.isIntegateCurrent, A.isTriggered, A.isMain, A.createdAt, A.updatedAt
    FROM ${this.table} A 
    LEFT JOIN ${this.tableUser} B
      ON A.userCode = B.userCode
    LEFT JOIN tbl_provinces C
      ON A.userHomeProvince = C.provinceCode
    WHERE A.isActive = 'Y' `;

    const params: any[] = [];

    if (dto.userCode) {
      query += ` AND A.userCode = ?`;
      params.push(dto.userCode);
    }

    query += ` ORDER BY COALESCE(A.updatedAt,  A.createdAt, A.seq) DESC `;

    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IUserHome[];
  }

    async getDetail(userHomeCode: string): Promise<IUserHomeSensor | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `
       SELECT A.seq, A.userCode, A.userHomeCode, A.userHomeName, A.userHomeAddress, A.userHomeProvince, A.userHomeDescription, A.userHomeImage,
       A.isIntegateTempHum, A.isIntegateCurrent,  A.isTriggered, A.isMain, A.uniqueId, B.macId, B.wifiId, B.wifiPassword
          FROM  ${this.table} A 
          LEFT JOIN ${this.tableSensor} B
          ON A.userHomeCode = B.userHomeCode
          WHERE A.userHomeCode = ? AND A.isActive = 'Y'
          LIMIT 1 `,
      [userHomeCode],
    );
    return rows ? (rows[0] as IUserHomeSensor) : null;
  }
  async triggerHome(userHomeCode: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.table}
      SET isTriggered = ?,  updatedId = ?, updatedAt = ?
      WHERE userHomeCode = ?  `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      'Y', // isTriggered
      updatedId, // updatedId
      new Date(),
      userHomeCode,
    ]);
    return result.affectedRows;
  }
  // TODO: SENSOR
  async insertSensorForHome(dto: TriggerUserHomeSensorDto, userHomeCode: string, createdId: string): Promise<number> {
    const sql = `
        INSERT INTO ${this.tableSensor}  (userHomeCode, userCode, macId, wifiId, wifiPassword, isActive, createdId) 
        VALUES(?, ?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      userHomeCode,
      dto.userCode,
      dto.macId,
      dto.wifiId,
      dto.wifiPassword,
      'Y', // isActive
      createdId,
    ]);

    return result.insertId;
  }
  async updateSensorForHome(dto: TriggerUserHomeSensorDto, userHomeCode: string, updatedId: string): Promise<number> {
    const sql = `
          UPDATE ${this.tableSensor}
      SET macId = ?,  wifiId = ?, wifiPassword = ?, isActive = ? , updatedId = ?, updatedAt = ?
      WHERE userCode = ? AND userHomeCode = ? 
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.macId,
      dto.wifiId,
      dto.wifiPassword,
      'Y', // isActive
      updatedId,
      new Date(),
      dto.userCode,
      userHomeCode
    ]);

    return result.affectedRows;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IUserHome } from '../userHome.interface';
import { GetHomesAdminDto } from './userHome.dto';
@Injectable()
export class UserHomeAdminRepository {
  private readonly table = 'tbl_user_home';
  private readonly tableImg = 'tbl_user_home_img';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getTotal(userCode: string): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table} WHERE userCode = ?`, [userCode]);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: GetHomesAdminDto): Promise<IUserHome[]> {
    let query = ` SELECT A.seq, A.userCode, A.userHomeCode, A.userHomeName, A.userHomeAddress, B.provinceName AS userHomeProvince, A.userHomeDescription, A.userHomeImage,
     A.isIntegateTempHum, A.isIntegateCurrent, A.isTriggered, A.isMain
    FROM ${this.table} A 
    LEFT JOIN  tbl_provinces B
    ON A.userHomeProvince = B.provinceCode
    WHERE A.userCode = ? AND A.isActive = 'Y' `;

    const params: any[] = [];
    params.push(dto.userCode);
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IUserHome[];
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateHomeSightSeeingDto } from './homeSale.dto';

@Injectable()
export class HomeSaleSightseeingAppRepository {
  private readonly tableSightSeeing = 'tbl_home_sale_sightseeing';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  // TODO: SIGHTSEEING 
  async registerSightSeeing(dto: CreateHomeSightSeeingDto, userCode: string, status: string): Promise<number> {
    const sql = `
        INSERT INTO ${this.tableSightSeeing}  (homeCode, userCode, userName, userPhone, numberAttendCode, note, status, createdId) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.homeCode, userCode, dto.userName, dto.userPhone, dto.numberAttendCode, dto.note, status, userCode]);

    return result.insertId;
  }
}

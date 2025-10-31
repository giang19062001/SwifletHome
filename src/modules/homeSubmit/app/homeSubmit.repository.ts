import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CreateHomeSubmitDto } from './homeSubmit.dto';
import { IHomeSubmit } from '../homeSubmit.interface';

@Injectable()
export class HomeSubmitAppRepository {
  private readonly table = 'tbl_home_submit';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async createHomeSubmit(dto: CreateHomeSubmitDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.table}  (homeCode, userCode, userName, userPhone, numberAttendCode, note, statusCode, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // COD000005: WAITING
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.homeCode, dto.userCode, dto.userName, dto.userPhone, dto.numberAttendCode, dto.note, 'COD000005', dto.userCode]);

    return result.insertId;
  }
}

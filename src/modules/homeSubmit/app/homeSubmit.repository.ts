import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CreateHomeSubmitDto } from './homeSubmit.dto';
import { IHomeSubmit } from '../homeSubmit.interface';

@Injectable()
export class HomeSubmitAppRepository {
  private readonly table = 'tbl_home_submit';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async create(dto: CreateHomeSubmitDto, userCode: string, statusCode: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.table}  (homeCode, userCode, userName, userPhone, numberAttendCode, note, statusCode, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.homeCode, userCode, dto.userName, dto.userPhone, dto.numberAttendCode, dto.note, statusCode, userCode]);

    return result.insertId;
  }
}

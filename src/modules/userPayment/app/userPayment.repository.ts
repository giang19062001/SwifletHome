import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CreateUserPaymentAppDto } from './userPayment.dto';

@Injectable()
export class UserPaymentAppRepository {
  private readonly table = 'tbl_user_payment';
  private readonly tableHistory = 'tbl_user_payment_history';

  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async createHistory(dto: CreateUserPaymentAppDto, createdAt: Date): Promise<number> {
    const sql = `
        INSERT INTO ${this.tableHistory} (userCode, packageCode, startDate, endDate, createdId, createdAt) 
        VALUES(?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.userCode, dto.packageCode, dto.startDate, dto.endDate, this.updator, createdAt]);

    return result.insertId;
  }
  async create(dto: CreateUserPaymentAppDto, createdAt: Date): Promise<number> {
    const sql = `
        INSERT INTO ${this.table} (userCode, packageCode, startDate, endDate, isActive, createdId, createdAt) 
        VALUES(?, ?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.userCode, dto.packageCode, dto.startDate, dto.endDate, 'Y', this.updator, createdAt]);

    return result.insertId;
  }

}

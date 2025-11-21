import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { UpdateUserPaymentAdminDto } from './userPayment.dto';

@Injectable()
export class UserPaymentAdminRepository {
  private readonly table = 'tbl_user_payment';
  private readonly tableHistory = 'tbl_user_payment_history';

  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async createHistory(dto: UpdateUserPaymentAdminDto, userCode: string, startDate: string | null, endDate: string | null, createdAt: Date): Promise<number> {
    const sql = `
        INSERT INTO ${this.tableHistory} (userCode, packageCode, startDate, endDate, createdId, createdAt) 
        VALUES(?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, dto.packageCode == "" ? null : dto.packageCode, startDate, endDate, this.updator, createdAt]);

    return result.insertId;
  }
  async update(dto: UpdateUserPaymentAdminDto, userCode: string, startDate: string | null, endDate: string | null, updatedAt: Date): Promise<number> {
    const sql = `
        UPDATE  ${this.table} SET packageCode = ?, startDate = ?, endDate = ?, updatedId = ?, updatedAt = ?
        WHERE userCode = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.packageCode == "" ? null : dto.packageCode, startDate, endDate, dto.updatedId, updatedAt, userCode]);

    return result.affectedRows;
  }
}

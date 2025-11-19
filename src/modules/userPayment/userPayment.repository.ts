import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin';
import { IUserAppPayment } from './userPayment.interface';
import { CreateUserPaymentDto } from './userPayment.dto';

@Injectable()
export class UserPaymentRepository {
  private readonly table = 'tbl_user_payment';
    private readonly updator = 'SYSTEM';


  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

    async create(dto: CreateUserPaymentDto): Promise<number> {
      const sql = `
        INSERT INTO ${this.table} (userCode, packageCode, startDate, endDate, isActive, createdId) 
        VALUES(?, ?, ?, ?, ?, ?)
      `;
      const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.userCode, dto.packageCode, dto.startDate, dto.endDate, 'Y', this.updator]);
  
      return result.insertId;
    }
}

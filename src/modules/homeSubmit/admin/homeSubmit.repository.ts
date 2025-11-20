import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin';
import { IHomeSubmit } from '../homeSubmit.interface';
import { UpdateStatusDto } from './homeSubmit.dto';

@Injectable()
export class HomeSubmitAdminRepository {
  private readonly table = 'tbl_home_sale_submit';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IHomeSubmit[]> {
    let query = `  SELECT A.seq, A.homeCode, A.userCode, A.userName, A.userPhone, A.numberAttendCode, A.statusCode, A.note, A.cancelReason, A.createdAt,
        B.homeName, B.homeImage, C.valueCode AS numberAttend, D.valueCode AS statusValue, D.keyCode as statusKey
        FROM ${this.table} A 
        LEFT JOIN tbl_home_sale B
        ON A.homeCode = B.homeCode
        LEFT JOIN tbl_code_common C
        ON A.numberAttendCode = C.code
        LEFT JOIN tbl_code_common D
        ON A.statusCode = D.code `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IHomeSubmit[];
  }

  async getDetail(seq: number): Promise<IHomeSubmit | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.homeCode, A.userCode, A.userName, A.userPhone, A.numberAttendCode, A.statusCode, A.note, A.cancelReason, A.createdAt,
        B.homeName, B.homeImage, C.valueCode AS numberAttend, D.valueCode AS statusValue, D.keyCode as statusKey
        FROM ${this.table} A 
        LEFT JOIN tbl_home_sale B
        ON A.homeCode = B.homeCode
        LEFT JOIN tbl_code_common C
        ON A.numberAttendCode = C.code
        LEFT JOIN tbl_code_common D
        ON A.statusCode = D.code
        WHERE A.SEQ = ? 
        LIMIT 1 `,
      [seq],
    );
    return rows ? (rows[0] as IHomeSubmit) : null;
  }

  async update(dto: UpdateStatusDto, seq: number): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET statusCode = ?, updatedId = ?, updatedAt = ?
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.statusCode, dto.updatedId, new Date(), seq]);

    return result.affectedRows;
  }
}

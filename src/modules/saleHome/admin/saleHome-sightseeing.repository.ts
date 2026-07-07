import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { SaleHomeSightSeeingResDto } from '../saleHome.response';
import { UpdateStatusSightseeingDto } from './saleHome.dto';

@Injectable()
export class SaleHomeSightseeingAdminRepository {
  private readonly tableSaleHome = 'tbl_sale_home';
  private readonly tableSightseeing = 'tbl_sale_home_sightseeing';
  private readonly tableOptionCommon = 'tbl_option_common';
  
  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  
  // TODO: SIGHTSEEING
  async getTotalSightseeing(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.tableSightseeing} WHERE isActive = 'Y'`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  
  async getAllSightseeing(dto: PagingDto): Promise<SaleHomeSightSeeingResDto[]> {
    let query = `  SELECT A.seq, A.homeCode, A.userCode, A.userName, A.userPhone, A.numberAttendCode, A.status, A.note, A.cancelReason, A.createdAt,
          B.homeName, C.valueOption AS numberAttend
          FROM ${this.tableSightseeing} A 
          LEFT JOIN ${this.tableSaleHome} B
          ON A.homeCode = B.homeCode
          LEFT JOIN ${this.tableOptionCommon} C
          ON A.numberAttendCode = C.code 
          WHERE A.isActive = 'Y'
          ORDER BY A.createdAt DESC`;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as SaleHomeSightSeeingResDto[];
  }

  async getDetailSightseeing(seq: number): Promise<SaleHomeSightSeeingResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.homeCode, A.userCode, A.userName, A.userPhone, A.numberAttendCode, A.status, A.note, A.cancelReason, A.createdAt,
          B.homeName, C.valueOption AS numberAttend
          FROM ${this.tableSightseeing} A 
          LEFT JOIN ${this.tableSaleHome} B
          ON A.homeCode = B.homeCode
          LEFT JOIN ${this.tableOptionCommon} C
          ON A.numberAttendCode = C.code
          WHERE A.SEQ = ? AND A.isActive = 'Y'
          LIMIT 1 `,
      [seq],
    );
    return rows.length ? (rows[0] as SaleHomeSightSeeingResDto) : null;
  }

  async updateSightseeing(dto: UpdateStatusSightseeingDto, updatedId: string, seq: number): Promise<number> {
    const sql = `
        UPDATE ${this.tableSightseeing} SET status = ?, updatedId = ?, updatedAt = ?
        WHERE seq = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.status, updatedId, new Date(), seq]);

    return result.affectedRows;
  }
}

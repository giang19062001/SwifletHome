import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { GetAllGuestConsulationDto } from './guest.dto';
import { GuestConsulationResDto } from './guest.response';

@Injectable()
export class GuestAdminRepository {
  private readonly table = 'tbl_guest_consulation';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(dto: GetAllGuestConsulationDto): Promise<number> {
    const params: any[] = [];
    let whereClause = 'WHERE 1=1';

    if (dto.keyword) {
      whereClause += ' AND (name LIKE ? OR phone LIKE ?)';
      params.push(`%${dto.keyword}%`, `%${dto.keyword}%`);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(seq) AS TOTAL FROM ${this.table} ${whereClause}`,
      params,
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }

  async getAll(dto: GetAllGuestConsulationDto): Promise<GuestConsulationResDto[]> {
    const params: any[] = [];
    let whereClause = 'WHERE 1=1';

    if (dto.keyword) {
      whereClause += ' AND (name LIKE ? OR phone LIKE ?)';
      params.push(`%${dto.keyword}%`, `%${dto.keyword}%`);
    }

    let limitClause = '';
    if (dto.limit > 0 && dto.page > 0) {
      limitClause = 'LIMIT ? OFFSET ?';
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT seq, name, phone, issueInterest, issueDescription, createdAt
       FROM ${this.table}
       ${whereClause}
       ORDER BY createdAt DESC
       ${limitClause}`,
      params,
    );
    return rows as GuestConsulationResDto[];
  }
}

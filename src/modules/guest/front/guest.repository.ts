import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateGuestConsulationDto } from './guest.dto';

@Injectable()
export class GuestRepository {
  private readonly table = 'tbl_guest_consulation';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async create(dto: CreateGuestConsulationDto): Promise<number> {
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO ${this.table} (name, phone, issueInterest, issueDescription, createdAt) VALUES (?, ?, ?, ?, NOW())`,
      [dto.name, dto.phone, dto.issueInterest, dto.issueDescription],
    );
    return result.insertId;
  }
}

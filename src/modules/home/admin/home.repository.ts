import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/common';
import { IHome } from '../home.interface';

@Injectable()
export class HomeRepository {
  private readonly table = 'tbl_home';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`,
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IHome[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.homeCode, A.homeName, A.homeAddress, A.latitude, A.longitude, A.seqMainImage, A.isActive, A.createdAt, A.updatedAt, A.createdId, A.updatedId 
        FROM ${this.table} A  ${dto.limit == 0 && dto.page == 0 ? '' : 'LIMIT ? OFFSET ?'} `,
        dto.limit == 0 && dto.page == 0
        ? []
        : [dto.limit, (dto.page - 1) * dto.limit],
    );
    return rows as IHome[];
  }
}

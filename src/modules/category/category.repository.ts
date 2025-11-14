import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { ICategory } from './category.interface';
import { PagingDto } from 'src/dto/common';
import { AbAdminRepo } from 'src/abstract/common';

@Injectable()
export class CategoryRepository extends AbAdminRepo {
  private readonly table = 'tbl_category';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {
    super();
  }

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<ICategory[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT seq, categoryCode, categoryName, isActive, createdAt, updatedAt, createdId, updatedId 
        FROM ${this.table}  ${dto.limit == 0 && dto.page == 0 ? '' : 'LIMIT ? OFFSET ?'} `,
      dto.limit == 0 && dto.page == 0 ? [] : [dto.limit, (dto.page - 1) * dto.limit],
    );
    return rows as ICategory[];
  }
  getDetail(dto: string | number): Promise<any | null> {
    throw new Error('Method not implemented.');
  }
  create(dto: any): Promise<number> {
    throw new Error('Method not implemented.');
  }
  update(dto: any, id: string | number): Promise<number> {
    throw new Error('Method not implemented.');
  }
  delete(dto: string | number): Promise<number> {
    throw new Error('Method not implemented.');
  }
}

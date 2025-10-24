import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { ICategoryQuestion } from './cateQuestion.interface';
import { PagingDto } from 'src/common/interface/dto';

@Injectable()
export class CateQuestionRepository {
  private readonly table = 'tbl_category_ques_ans';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getCountCategoryQuestion(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(seq) AS CNT FROM ${this.table}`,
    );
    return rows.length ? (rows[0].CNT as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<ICategoryQuestion[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT seq, categoryCode, categoryName, isActive, createdAt, updatedAt, createdId, updatedId 
        FROM ${this.table} LIMIT ? OFFSET ? `,
      [dto.limit, (dto.page - 1) * dto.limit],
    );
    return rows as ICategoryQuestion[];
  }
}

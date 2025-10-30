import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/common';
import { IAnswer } from '../answer.interface';

@Injectable()
export class AnswerAppRepository {
  private readonly table = 'tbl_answer';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

    async getAnswerContent(answerCode: string): Promise<IAnswer | null> {
      const [rows] = await this.db.query<RowDataPacket[]>(
        ` SELECT A.answerCode, A.answerContentRaw
          FROM ${this.table} A
          WHERE A.answerCode = ? `,
        [answerCode],
      );
      return rows ? (rows[0] as IAnswer) : null;
    }

}

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IAnswer } from '../answer.interface';

@Injectable()
export class AnswerAppRepository {
  private readonly table = 'tbl_answer';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

    async getAnswerReply(answerCode: string): Promise<IAnswer | null> {
      const [rows] = await this.db.query<RowDataPacket[]>(
        ` SELECT A.answerCode, A.answerContent, A.isFree
          FROM ${this.table} A
          WHERE A.answerCode = ? AND A.isDelete = 'Y' `,
        [answerCode],
      );
      return rows ? (rows[0] as IAnswer) : null;
    }

}

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { IQuestion } from '../question.interface';

@Injectable()
export class QuestionAppRepository {
  private readonly table = 'tbl_question';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getQuestionReplied(): Promise<IQuestion[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT  A.questionContent, A.answerCode
        FROM ${this.table} A 
       WHERE A.answerCode IS NOT NULL `,
    );
    return rows as IQuestion[];
  }
}

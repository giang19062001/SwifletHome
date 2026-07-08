import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { AnswerAppResDto } from './answer.response';

@Injectable()
export class AnswerAppRepository {
  private readonly table = 'tbl_answer';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getAnswerReply(answerCode: string): Promise<AnswerAppResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.answerCode, A.answerContent, A.isFree
          FROM ${this.table} A
          WHERE A.answerCode = ? AND A.isActive = 'Y' `,
      [answerCode],
    );
    return rows.length ? (rows[0] as AnswerAppResDto) : null;
  }

  async getAnswersByCodes(answerCodes: string[]): Promise<AnswerAppResDto[]> {
    if (!answerCodes || !answerCodes.length) return [];
    const placeholders = answerCodes.map(() => '?').join(',');
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.answerCode, A.answerContent, A.isFree
          FROM ${this.table} A
          WHERE A.answerCode IN (${placeholders}) AND A.isActive = 'Y' `,
      answerCodes,
    );
    return rows as AnswerAppResDto[];
  }

  async getAnswersAll(): Promise<AnswerAppResDto[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.answerCode, A.answerContent, A.isFree
          FROM ${this.table} A
          WHERE A.isActive = 'Y' `,
    );
    return rows as AnswerAppResDto[];
  }
}

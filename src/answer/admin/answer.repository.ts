import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/common/interface/dto';
import { IAnswer } from '../answer.interface';
import { GetAllAnswerDto, UpdateAnswerDto } from './answer.dto';

@Injectable()
export class AnswerAdminRepository {
  private readonly table = 'tbl_answer';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getCountAnswer(dto: GetAllAnswerDto): Promise<number> {
    const params: any[] = [];

    let whereClause = 'WHERE 1 = 1';

    if (dto.answerObject) {
      whereClause += ' AND answerObject = ?';
      params.push(dto.answerObject);
    }

    if (dto.categoryAnsCode) {
      whereClause += ' AND categoryAnsCode = ?';
      params.push(dto.categoryAnsCode);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(seq) AS CNT FROM ${this.table} ${whereClause}`,
      params,
    );
    return rows.length ? (rows[0].CNT as number) : 0;
  }
  async getAll(dto: GetAllAnswerDto): Promise<IAnswer[]> {
    const params: any[] = [];

    let whereClause = 'WHERE 1 = 1';

    if (dto.answerObject) {
      whereClause += ' AND A.answerObject = ?';
      params.push(dto.answerObject);
    }

    if (dto.categoryAnsCode) {
      whereClause += ' AND A.categoryAnsCode = ?';
      params.push(dto.categoryAnsCode);
    }

    // ALL
    let limitClause = '';
    if (dto.limit > 0 && dto.page > 0) {
      limitClause = 'LIMIT ? OFFSET ?';
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.answerCode, A.answerContent, A.answerContentRaw, A.answerObject, A.categoryAnsCode, A.isActive, A.isFree, A.createdAt, A.createdId,
      B.categoryName, C.objectName
      FROM ${this.table} A 
      LEFT JOIN tbl_category_ques_ans B ON A.categoryAnsCode = B.categoryCode
      LEFT JOIN tbl_object C ON A.answerObject = C.objectCharacter
      ${whereClause}
      ${limitClause}`,
      params,
    );
    return rows as IAnswer[];
  }
  async getDetail(answerCode: string): Promise<IAnswer | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.answerCode, A.answerContent, A.answerContentRaw, A.answerObject, A.categoryAnsCode, A.isActive, A.isFree, A.createdAt, A.createdId,
        B.categoryName, C.objectName
        FROM ${this.table} A 
        LEFT JOIN tbl_category_ques_ans B
        ON A.categoryAnsCode = B.categoryCode
        LEFT JOIN tbl_object C
        ON A.answerObject = C.objectCharacter
        WHERE A.answerCode = ? `,
      [answerCode],
    );
    return rows ? (rows[0] as IAnswer) : null;
  }
  async updateAnswer(dto: UpdateAnswerDto): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET answerContent = ?, answerContentRaw = ?
      WHERE answerCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.answerContent,
      dto.answerContentRaw,
      dto.answerCode,
    ]);

    return result.affectedRows;
  }
}

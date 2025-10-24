import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/common/interface/dto';
import { IQuestion } from '../question.interface';
import { UpdateQuestionDto } from './question.dto';

@Injectable()
export class QuestionRepository {
  private readonly table = 'tbl_question';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getCountQuestion(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(seq) AS CNT FROM ${this.table}`,
    );
    return rows.length ? (rows[0].CNT as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IQuestion[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.questionCode, A.questionContent, A.questionObject, A.categoryQuesCode, A.isActive, A.createdAt, A.createdId, A.answerCode,
        B.categoryName, C.objectName
        FROM ${this.table} A 
        LEFT JOIN tbl_category_ques_ans B
        ON A.categoryQuesCode = B.categoryCode
        LEFT JOIN tbl_object C
        ON A.questionObject = C.objectCharacter
        LIMIT ? OFFSET ? `,
      [dto.limit, (dto.page - 1) * dto.limit],
    );
    return rows as IQuestion[];
  }
  async getDetail(questionCode: string): Promise<IQuestion | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.questionCode, A.questionContent, A.questionObject, A.categoryQuesCode, A.isActive, A.createdAt, A.createdId, A.answerCode,
        B.categoryName, C.objectName, D.answerContent
        FROM ${this.table} A 
        LEFT JOIN tbl_category_ques_ans B
        ON A.categoryQuesCode = B.categoryCode
        LEFT JOIN tbl_object C
        ON A.questionObject = C.objectCharacter
        LEFT JOIN tbl_answer D
        ON A.answerCode = D.answerCode
        WHERE A.questionCode = ? `,
      [questionCode],
    );
    return rows ? (rows[0] as IQuestion) : null;
  }

  async updateQuestion(dto: UpdateQuestionDto): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET answerCode = ?, questionObject = ?, questionContent = ?, categoryQuesCode = ? 
      WHERE questionCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.answerCode,
      dto.questionObject,
      dto.questionContent,
      dto.categoryQuesCode,
      dto.questionCode,
    ]);

    return result.affectedRows;
  }
}

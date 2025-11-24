import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { IQuestion } from '../question.interface';
import { CreateQuestionDto, UpdateQuestionDto } from './question.dto';
import { generateCode } from 'src/helpers/func.helper';

@Injectable()
export class QuestionAdminRepository {
  private readonly table = 'tbl_question';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IQuestion[]> {
    let query = ` SELECT A.seq, A.questionCode, A.questionContent, A.questionObject, A.questionCategory, A.isActive, A.createdAt, A.createdId, A.answerCode,
        B.categoryName, C.objectName
        FROM ${this.table} A 
        LEFT JOIN tbl_category B
        ON A.questionCategory = B.categoryCode
        LEFT JOIN tbl_object C
        ON A.questionObject = C.objectKeyword `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IQuestion[];
  }
  async getDetail(questionCode: string): Promise<IQuestion | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.questionCode, A.questionContent, A.questionObject, A.questionCategory, A.isActive, A.createdAt, A.createdId, A.answerCode,
        B.categoryName, C.objectName, D.answerContent
        FROM ${this.table} A 
        LEFT JOIN tbl_category B
        ON A.questionCategory = B.categoryCode
        LEFT JOIN tbl_object C
        ON A.questionObject = C.objectKeyword
        LEFT JOIN tbl_answer D
        ON A.answerCode = D.answerCode
        WHERE A.questionCode = ? 
        LIMIT 1`,
      [questionCode],
    );
    return rows ? (rows[0] as IQuestion) : null;
  }
  async create(dto: CreateQuestionDto, createdId: string): Promise<number> {
    const sqlLast = ` SELECT questionCode FROM ${this.table} ORDER BY questionCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let questionCode = 'QUS000001';
    if (rows.length > 0) {
      questionCode = generateCode(rows[0].questionCode, 'QUS', 6);
    }
    const sql = `
      INSERT INTO ${this.table}  (questionCode, answerCode, questionObject, questionContent, questionCategory, createdId) 
      VALUES(?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [questionCode, dto.answerCode, dto.questionObject, dto.questionContent, dto.questionCategory, createdId]);

    return result.insertId;
  }
  async update(dto: UpdateQuestionDto, updatedId: string, questionCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET answerCode = ?, questionObject = ?, questionContent = ?, questionCategory = ?,
      updatedId = ?, updatedAt = ?
      WHERE questionCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.answerCode, dto.questionObject, dto.questionContent, dto.questionCategory, updatedId, new Date(), questionCode]);

    return result.affectedRows;
  }

  async delete(questionCode: string): Promise<number> {
    const sql = `
      DELETE FROM ${this.table}
      WHERE questionCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [questionCode]);

    return result.affectedRows;
  }

  async getAllByAnswer(answerCode: string): Promise<IQuestion[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.questionCode, A.questionContent, A.questionObject, A.questionCategory, A.isActive, A.createdAt, A.createdId, A.answerCode,
        B.categoryName, C.objectName
        FROM ${this.table} A 
        LEFT JOIN tbl_category B
        ON A.questionCategory = B.categoryCode
        LEFT JOIN tbl_object C
        ON A.questionObject = C.objectKeyword
        WHERE A.answerCode IS NOT NULL AND A.answerCode = ?`,
      [answerCode],
    );
    return rows as IQuestion[];
  }
  async updateAnswerQuestionNull(questionCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET answerCode = ?
      WHERE questionCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [null, questionCode]);

    return result.affectedRows;
  }
}

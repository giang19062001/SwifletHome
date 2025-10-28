import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/common';
import { IAnswer } from '../answer.interface';
import {
  CreateAnswerDto,
  GetAllAnswerDto,
  UpdateAnswerDto,
} from './answer.dto';
import { generateCode } from 'src/helpers/func';

@Injectable()
export class AnswerAdminRepository {
  private readonly table = 'tbl_answer';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(dto: GetAllAnswerDto): Promise<number> {
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
      ` SELECT COUNT(seq) AS TOTAL FROM ${this.table} ${whereClause}`,
      params,
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
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
      LEFT JOIN tbl_object_ques_ans C ON A.answerObject = C.objectCharacter
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
        LEFT JOIN tbl_object_ques_ans C
        ON A.answerObject = C.objectCharacter
        WHERE A.answerCode = ? `,
      [answerCode],
    );
    return rows ? (rows[0] as IAnswer) : null;
  }
  async createAnswer(dto: CreateAnswerDto): Promise<number> {
    const sqlLast = ` SELECT answerCode FROM ${this.table} ORDER BY answerCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let answerCode = 'ANS000001';
    if (rows.length > 0) {
      answerCode = generateCode(rows[0].answerCode, 'ANS', 6);
    }
    const sql = `
        INSERT INTO ${this.table}  (answerCode, answerContent, answerContentRaw, answerObject, categoryAnsCode, createdId) 
        VALUES(?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      answerCode,
      dto.answerContent,
      dto.answerContentRaw,
      dto.answerObject,
      dto.categoryAnsCode,
      dto.createdId
    ]);

    return result.insertId;
  }
  async updateAnswer(dto: UpdateAnswerDto): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET answerContent = ?, answerContentRaw = ?, answerObject = ?, categoryAnsCode = ?
      WHERE answerCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.answerContent,
      dto.answerContentRaw,
      dto.answerObject,
      dto.categoryAnsCode,
      dto.answerCode,
    ]);

    return result.affectedRows;
  }

  async deleteAnswer(answerCode: string): Promise<number> {
    const sql = `
      DELETE FROM ${this.table}
      WHERE answerCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      answerCode,
    ]);

    return result.affectedRows;
  }
}

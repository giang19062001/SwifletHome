import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { IAnswer } from '../answer.interface';
import { CreateAnswerDto, GetAllAnswerDto, UpdateAnswerDto } from './answer.dto';
import { generateCode } from 'src/helpers/func.helper';

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

    if (dto.answerCategory) {
      whereClause += ' AND answerCategory = ?';
      params.push(dto.answerCategory);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table} ${whereClause}`, params);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: GetAllAnswerDto): Promise<IAnswer[]> {
    const params: any[] = [];

    let whereClause = 'WHERE 1 = 1';

    if (dto.answerObject) {
      whereClause += ' AND A.answerObject = ?';
      params.push(dto.answerObject);
    }

    if (dto.answerCategory) {
      whereClause += ' AND A.answerCategory = ?';
      params.push(dto.answerCategory);
    }

    // ALL
    let limitClause = '';
    if (dto.limit > 0 && dto.page > 0) {
      limitClause = 'LIMIT ? OFFSET ?';
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.answerCode, A.answerContent, A.answerObject, A.answerCategory, A.isActive, A.isFree, A.createdAt, A.createdId,
      B.categoryName, C.objectName
      FROM ${this.table} A 
      LEFT JOIN tbl_category B ON A.answerCategory = B.categoryCode
      LEFT JOIN tbl_object C ON A.answerObject = C.objectKeyword
      ${whereClause}
      ${limitClause}`,
      params,
    );
    return rows as IAnswer[];
  }
  async getDetail(answerCode: string): Promise<IAnswer | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.answerCode, A.answerContent, A.answerObject, A.answerCategory, A.isActive, A.isFree, A.createdAt, A.createdId,
        B.categoryName, C.objectName
        FROM ${this.table} A 
        LEFT JOIN tbl_category B
        ON A.answerCategory = B.categoryCode
        LEFT JOIN tbl_object C
        ON A.answerObject = C.objectKeyword
        WHERE A.answerCode = ? 
        LIMIT 1 `,
      [answerCode],
    );
    return rows ? (rows[0] as IAnswer) : null;
  }
  async create(dto: CreateAnswerDto): Promise<number> {
    const sqlLast = ` SELECT answerCode FROM ${this.table} ORDER BY answerCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let answerCode = 'ANS000001';
    if (rows.length > 0) {
      answerCode = generateCode(rows[0].answerCode, 'ANS', 6);
    }
    const sql = `
        INSERT INTO ${this.table}  (answerCode, answerContent, answerObject, answerCategory, isFree, createdId) 
        VALUES(?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [answerCode, dto.answerContent, dto.answerObject, dto.answerCategory, dto.isFree, dto.createdId]);

    return result.insertId;
  }
  async update(dto: UpdateAnswerDto, answerCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET answerContent = ?, answerObject = ?, answerCategory = ?, isFree = ?,
      updatedId = ?, updatedAt = ?
      WHERE answerCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.answerContent, dto.answerObject, dto.answerCategory, dto.isFree, dto.updatedId, new Date(), answerCode]);

    return result.affectedRows;
  }

  async delete(answerCode: string): Promise<number> {
    const sql = `
      DELETE FROM ${this.table}
      WHERE answerCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [answerCode]);

    return result.affectedRows;
  }
}

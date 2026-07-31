import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CODES } from 'src/helpers/const.helper';
import { generateCode } from 'src/helpers/func.helper';

@Injectable()
export class TraceabilityAppRepository {
  private readonly tableForms = 'tbl_traceability_forms';
  private readonly tableGroups = 'tbl_traceability_forms_groups';
  private readonly tableFields = 'tbl_traceability_forms_fields';
  private readonly tableSubmissions = 'tbl_traceability_submissions';
  private readonly tableFile = 'tbl_traceability_file';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getFormByKey(formKey: string): Promise<RowDataPacket | null> {
    const sql = `SELECT seq, formKey, formName FROM ${this.tableForms} WHERE formKey = ? AND isActive = 'Y' LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [formKey]);
    return rows[0] || null;
  }

  async getAllForms(): Promise<RowDataPacket[]> {
    const sql = `SELECT seq, formKey, formName, sortOrder FROM ${this.tableForms} WHERE isActive = 'Y' ORDER BY sortOrder ASC`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql);
    return rows;
  }

  async getGroupsByFormSeq(formSeq: number): Promise<RowDataPacket[]> {
    const sql = `
      SELECT seq, groupKey, groupName 
      FROM ${this.tableGroups} 
      WHERE formSeq = ? AND isActive = 'Y' 
      ORDER BY sortOrder ASC
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [formSeq]);
    return rows;
  }

  async getFieldsByFormSeq(formSeq: number): Promise<RowDataPacket[]> {
    const sql = `
      SELECT seq, groupSeq, fieldKey, fieldName, fieldType, isRequired, sortOrder, config 
      FROM ${this.tableFields} 
      WHERE formSeq = ? AND isActive = 'Y' 
      ORDER BY groupSeq ASC, sortOrder ASC
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [formSeq]);
    return rows;
  }

  async getSubmissionByCode(traceabilityCode: string, userHomeCode?: string): Promise<RowDataPacket | null> {
    let sql = `
      SELECT seq, traceabilityCode, formSeq, userCode, userHomeCode, formData, uniqueId, status 
      FROM ${this.tableSubmissions} 
      WHERE traceabilityCode = ? AND isActive = 'Y'
    `;
    const params: any[] = [traceabilityCode];
    if (userHomeCode) {
      sql += ` AND userHomeCode = ?`;
      params.push(userHomeCode);
    }
    sql += ` LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, params);
    return rows[0] || null;
  }

  async getSubmissionByUserHomeForm(userCode: string, userHomeCode: string, formSeq: number): Promise<RowDataPacket | null> {
    const sql = `
      SELECT seq, traceabilityCode, formSeq, userCode, userHomeCode, formData, uniqueId, status 
      FROM ${this.tableSubmissions} 
      WHERE userCode = ? AND userHomeCode = ? AND formSeq = ? AND isActive = 'Y' 
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [userCode, userHomeCode, formSeq]);
    return rows[0] || null;
  }

  async getFilesByUniqueId(uniqueId: string): Promise<RowDataPacket[]> {
    const sql = `
      SELECT seq, submissionSeq, uniqueId, fieldKey, fieldType, filename, originalname, size, mimetype, sortOrder 
      FROM ${this.tableFile} 
      WHERE uniqueId = ? AND isActive = 'Y' 
      ORDER BY fieldKey ASC, sortOrder ASC
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);
    return rows;
  }

  async deactivateFilesForFieldSingle(uniqueId: string, fieldKey: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableFile} 
      SET isActive = 'N', updatedAt = NOW() 
      WHERE uniqueId = ? AND fieldKey = ? AND fieldType = 'file_single' AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [uniqueId, fieldKey]);
    return result.affectedRows;
  }

  async insertFile(uniqueId: string, fieldKey: string, fieldType: string, filename: string, originalname: string, size: number, mimetype: string, createdId: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableFile} 
        (submissionSeq, uniqueId, fieldKey, fieldType, filename, originalname, size, mimetype, createdId) 
      VALUES (0, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [uniqueId, fieldKey, fieldType, filename, originalname, size, mimetype, createdId]);
    return result.insertId;
  }

  async getFileBySeq(seq: number): Promise<RowDataPacket | null> {
    const sql = `SELECT seq, filename, createdId FROM ${this.tableFile} WHERE seq = ? LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [seq]);
    return rows[0] || null;
  }

  async deleteFileBySeq(seq: number): Promise<number> {
    const sql = `DELETE FROM ${this.tableFile} WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);
    return result.affectedRows;
  }

  async generateTraceabilityCode(): Promise<string> {
    const sqlLast = `SELECT traceabilityCode FROM ${this.tableSubmissions} ORDER BY seq DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let traceabilityCode = CODES.traceabilityCode.FRIST_CODE;
    if (rows.length > 0) {
      traceabilityCode = generateCode(rows[0].traceabilityCode, CODES.traceabilityCode.PRE, CODES.traceabilityCode.LEN);
    }
    return traceabilityCode;
  }

  async insertSubmission(traceabilityCode: string, formSeq: number, userCode: string, userHomeCode: string, formData: string, uniqueId: string, createdId: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableSubmissions} 
        (traceabilityCode, formSeq, userCode, userHomeCode, formData, uniqueId, status, createdId) 
      VALUES (?, ?, ?, ?, ?, ?, 'WAITING', ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [traceabilityCode, formSeq, userCode, userHomeCode, formData, uniqueId, createdId]);
    return result.insertId;
  }

  async updateSubmission(seq: number, formData: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableSubmissions} 
      SET formData = ?, updatedId = ?, updatedAt = NOW() 
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [formData, updatedId, seq]);
    return result.affectedRows;
  }

  async bindFilesToSubmission(submissionSeq: number, uniqueId: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableFile} 
      SET submissionSeq = ?, updatedId = ?, updatedAt = NOW() 
      WHERE uniqueId = ? AND submissionSeq = 0
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [submissionSeq, updatedId, uniqueId]);
    return result.affectedRows;
  }

  async checkExistUniqueId(uniqueId: string): Promise<boolean> {
    const sql = `SELECT seq FROM ${this.tableSubmissions} WHERE uniqueId = ? LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);
    return rows.length > 0;
  }

  async getFilesNotUse(): Promise<{ seq: number; filename: string }[]> {
    const sql = `
      SELECT seq, filename 
      FROM ${this.tableFile} 
      WHERE submissionSeq = 0 OR uniqueId NOT IN (SELECT uniqueId FROM ${this.tableSubmissions} WHERE uniqueId IS NOT NULL)
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(sql);
    return rows as { seq: number; filename: string }[];
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CODES } from 'src/helpers/const.helper';
import { generateCode } from 'src/helpers/func.helper';
import { generateTraceabilityId, generateTraceabilityQr } from './traceability.func';
@Injectable()
export class TraceabilityAppRepository {
  private readonly tableForms = 'tbl_traceability_forms';
  private readonly tableGroups = 'tbl_traceability_forms_groups';
  private readonly tableFields = 'tbl_traceability_forms_fields';
  private readonly tableSubmissions = 'tbl_traceability_submissions';
  private readonly tableBatches = 'tbl_traceability_batches';
  private readonly tableFile = 'tbl_traceability_file';
  private readonly tableUserHome = 'tbl_user_home';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getFormByKey(formKey: string): Promise<RowDataPacket | null> {
    const sql = `SELECT seq, formKey, formName, formDescription FROM ${this.tableForms} WHERE formKey = ? AND isActive = 'Y' LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [formKey]);
    return rows[0] || null;
  }

  async getAllForms(): Promise<RowDataPacket[]> {
    const sql = `
      SELECT 
        seq, 
        formKey, 
        formName, 
        formDescription, 
        sortOrder
      FROM ${this.tableForms}
      WHERE isActive = 'Y' 
      ORDER BY sortOrder ASC
    `;
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

  async getNextBatchIndex(userCode: string, userHomeCode: string): Promise<number> {
    const sql = `SELECT COUNT(seq) as total FROM ${this.tableBatches} WHERE userCode = ? AND userHomeCode = ?`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [userCode, userHomeCode]);
    return (rows[0]?.total || 0) + 1;
  }

  async getLatestBatchByUserHome(userCode: string, userHomeCode: string): Promise<RowDataPacket | null> {
    const sql = `
      SELECT seq, traceabilityId, userCode, userHomeCode, status, qrUrl, harvestPhases 
      FROM ${this.tableBatches} 
      WHERE userCode = ? AND userHomeCode = ? AND isActive = 'Y' 
      ORDER BY seq DESC 
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [userCode, userHomeCode]);
    return rows[0] || null;
  }

  async findOrCreateBatch(userCode: string, userHomeCode: string, createdId: string, harvestPhases: string | null = null): Promise<RowDataPacket> {
    const selectSql = `
      SELECT seq, traceabilityId, userCode, userHomeCode, status, qrUrl, harvestPhases 
      FROM ${this.tableBatches} 
      WHERE userCode = ? AND userHomeCode = ? AND isActive = 'Y' 
      ORDER BY seq DESC 
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(selectSql, [userCode, userHomeCode]);
    if (rows[0]) {
      if (harvestPhases && rows[0].harvestPhases !== harvestPhases) {
        const updateSql = `UPDATE ${this.tableBatches} SET harvestPhases = ?, updatedAt = NOW() WHERE seq = ?`;
        await this.db.execute(updateSql, [harvestPhases, rows[0].seq]);
        rows[0].harvestPhases = harvestPhases;
      }
      return rows[0];
    }

    const batchIndex = await this.getNextBatchIndex(userCode, userHomeCode);
    const traceabilityId = generateTraceabilityId(userCode, userHomeCode, batchIndex);
    const qrUrl = generateTraceabilityQr(userCode, userHomeCode, batchIndex);

    const insertSql = `
      INSERT INTO ${this.tableBatches} 
        (traceabilityId, userCode, userHomeCode, status, qrUrl, harvestPhases, createdId) 
      VALUES (?, ?, ?, 'PROCESSING', ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(insertSql, [traceabilityId, userCode, userHomeCode, qrUrl, harvestPhases, createdId]);
    return {
      seq: result.insertId,
      traceabilityId,
      userCode,
      userHomeCode,
      status: 'PROCESSING',
      qrUrl,
      harvestPhases,
    } as RowDataPacket;
  }

  async getSubmissionByCode(traceabilityCode: string, userHomeCode?: string): Promise<RowDataPacket | null> {
    let sql = `
      SELECT S.seq, S.batchSeq, S.traceabilityCode, S.formSeq, S.userCode, S.userHomeCode, S.formData, S.uniqueId, 
             B.status, B.qrUrl, B.traceabilityId, B.harvestPhases 
      FROM ${this.tableSubmissions} S
      JOIN ${this.tableBatches} B ON S.batchSeq = B.seq
      WHERE S.traceabilityCode = ? AND S.isActive = 'Y' AND B.isActive = 'Y'
    `;
    const params: any[] = [traceabilityCode];
    if (userHomeCode) {
      sql += ` AND S.userHomeCode = ?`;
      params.push(userHomeCode);
    }
    sql += ` LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, params);
    return rows[0] || null;
  }

  async getSubmissionByUserHomeForm(userCode: string, userHomeCode: string, formSeq: number): Promise<RowDataPacket | null> {
    const sql = `
      SELECT S.seq, S.batchSeq, S.traceabilityCode, S.formSeq, S.userCode, S.userHomeCode, S.formData, S.uniqueId, 
             B.status, B.qrUrl, B.traceabilityId, B.harvestPhases 
      FROM ${this.tableSubmissions} S
      JOIN ${this.tableBatches} B ON S.batchSeq = B.seq
      WHERE S.userCode = ? AND S.userHomeCode = ? AND S.formSeq = ? AND S.isActive = 'Y' AND B.isActive = 'Y'
      ORDER BY S.seq DESC
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

  async getUserHomeProvince(userHomeCode: string): Promise<string | null> {
    const sql = `SELECT userHomeProvince FROM ${this.tableUserHome} WHERE userHomeCode = ? AND isActive = 'Y' LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [userHomeCode]);
    return rows[0]?.userHomeProvince || null;
  }

  async insertSubmission(batchSeq: number, traceabilityCode: string, formSeq: number, userCode: string, userHomeCode: string, formData: string, uniqueId: string, createdId: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableSubmissions} 
        (batchSeq, traceabilityCode, formSeq, userCode, userHomeCode, formData, uniqueId, createdId) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [batchSeq, traceabilityCode, formSeq, userCode, userHomeCode, formData, uniqueId, createdId]);
    return result.insertId;
  }

  async updateSubmission(seq: number, formData: string, updatedId: string, harvestPhases: string | null = null, batchSeq?: number): Promise<number> {
    const sql = `
      UPDATE ${this.tableSubmissions} 
      SET formData = ?, updatedId = ?, updatedAt = NOW() 
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [formData, updatedId, seq]);
    if (harvestPhases && batchSeq) {
      const updateBatchSql = `
        UPDATE ${this.tableBatches}
        SET harvestPhases = ?, updatedId = ?, updatedAt = NOW()
        WHERE seq = ?
      `;
      await this.db.execute(updateBatchSql, [harvestPhases, updatedId, batchSeq]);
    }
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

  async getDynamicOptions(sql: string, userCode: string, userHomeCode: string): Promise<RowDataPacket[]> {
    const values: any[] = [];
    const parsedSql = sql.replace(/:([a-zA-Z0-9_]+)/g, (match, key) => {
      if (key === 'userCode') {
        values.push(userCode);
        return '?';
      }
      if (key === 'userHomeCode') {
        values.push(userHomeCode);
        return '?';
      }
      return match;
    });

    const [rows] = await this.db.execute<RowDataPacket[]>(parsedSql, values);
    return rows;
  }

  async getUserHouses(userCode: string): Promise<RowDataPacket[]> {
    const sql = `
      SELECT userCode, userHomeCode, userHomeName, userHomeAddress, userHomeProvince, isMain 
      FROM ${this.tableUserHome} 
      WHERE userCode = ? AND isActive = 'Y'
      ORDER BY isMain DESC
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [userCode]);
    return rows;
  }

  async getSubmissionsFormDataByUserHome(userCode: string, userHomeCode: string): Promise<any[]> {
    const sql = `
      SELECT formData 
      FROM ${this.tableSubmissions} 
      WHERE userCode = ? AND userHomeCode = ? AND isActive = 'Y'
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [userCode, userHomeCode]);
    return rows
      .map((r) => {
        try {
          return typeof r.formData === 'string' ? JSON.parse(r.formData) : r.formData;
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  }
}

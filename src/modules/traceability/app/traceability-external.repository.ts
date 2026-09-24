import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CODES } from 'src/helpers/const.helper';
import { generateCode } from 'src/helpers/func.helper';
import { FINAL_FORM_SEQ } from '../common/traceability.const';
import { TraceabilityStatusEnum } from '../common/traceability.enum';
import { GetSubmissionBatchListDto } from './traceability.dto';
import { generateTraceabilityIdAndQrExternal } from './traceability.func';

@Injectable()
export class TraceabilityExternalRepository {
  private readonly tableForms = 'tbl_traceability_forms';
  private readonly tableGroups = 'tbl_traceability_forms_groups';
  private readonly tableFields = 'tbl_traceability_forms_fields';
  private readonly tableSubmissionsExt = 'tbl_traceability_submissions_external';
  private readonly tableBatchesExt = 'tbl_traceability_batches_external';
  private readonly tableFileExt = 'tbl_traceability_file_external';
  private readonly tableBatchesExtraLinked = 'tbl_traceability_batches_extra_linked';
  private readonly tableSubmissionsInl = 'tbl_traceability_submissions';
  private readonly tableBatchesInl = 'tbl_traceability_batches';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getProcessingBatchByUser(userCode: string): Promise<RowDataPacket | null> {
    const sql = `
      SELECT seq, traceabilityId, userCode, status, qrUrl, lotcode 
      FROM ${this.tableBatchesExt} 
      WHERE userCode = ? AND status = '${TraceabilityStatusEnum.PROCESSING}' AND isActive = 'Y' 
      ORDER BY seq DESC 
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [userCode]);
    return rows[0] || null;
  }

  async getBatchByTraceabilityId(traceabilityId: string, userCode?: string): Promise<RowDataPacket | null> {
    let sql = `
      SELECT seq, traceabilityId, userCode, status, qrUrl, lotcode 
      FROM ${this.tableBatchesExt} 
      WHERE traceabilityId = ? AND isActive = 'Y' 
    `;
    const params: any[] = [traceabilityId];
    if (userCode) {
      sql += ` AND userCode = ?`;
      params.push(userCode);
    }
    sql += ` LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, params);
    return rows[0] || null;
  }

  async createBatch(userCode: string, createdId: string, lotcode?: string): Promise<RowDataPacket> {
    const { traceabilityId, qrUrl } = generateTraceabilityIdAndQrExternal(userCode);
    const insertSql = `
      INSERT INTO ${this.tableBatchesExt} 
        (traceabilityId, userCode, status, qrUrl, lotcode, createdId) 
      VALUES (?, ?, '${TraceabilityStatusEnum.PROCESSING}', ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(insertSql, [traceabilityId, userCode, qrUrl, lotcode || null, createdId]);
    return {
      seq: result.insertId,
      traceabilityId,
      userCode,
      status: TraceabilityStatusEnum.PROCESSING,
      qrUrl,
      lotcode: lotcode || null,
    } as RowDataPacket;
  }

  async updateBatchLotcode(seq: number, lotcode: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableBatchesExt} 
      SET lotcode = ?, updatedAt = NOW(), updatedId = ? 
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [lotcode, updatedId, seq]);
    return result.affectedRows;
  }

  async checkDuplicateLotcode(lotcode: string, excludeBatchSeq?: number | null): Promise<boolean> {
    let sql = `
      SELECT seq 
      FROM ${this.tableBatchesExt} 
      WHERE lotcode = ? AND isActive = 'Y'
    `;
    const params: any[] = [lotcode];
    if (excludeBatchSeq) {
      sql += ` AND seq != ?`;
      params.push(excludeBatchSeq);
    }
    sql += ` LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, params);
    return rows.length > 0;
  }

  async getFormByKey(formKey: string): Promise<RowDataPacket | null> {
    const sql = `SELECT seq, formKey, formName, formDescription FROM ${this.tableForms} WHERE formKey = ? AND isActive = 'Y' LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [formKey]);
    return rows[0] || null;
  }

  async getGroupsByFormSeq(formSeq: number): Promise<RowDataPacket[]> {
    const sql = `
      SELECT seq, groupKey, groupName, isLoop 
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

  async getSubmissionByUserForm(userCode: string, formSeq: number): Promise<RowDataPacket | null> {
    const sql = `
      SELECT S.seq, S.batchSeq, S.traceabilityCode, S.formSeq, S.userCode, S.formData, S.uniqueId, 
             B.status, B.qrUrl, B.traceabilityId, B.lotcode 
      FROM ${this.tableSubmissionsExt} S
      JOIN ${this.tableBatchesExt} B ON S.batchSeq = B.seq
      WHERE S.userCode = ? AND S.formSeq = ? AND S.isActive = 'Y' AND B.isActive = 'Y' AND B.status = '${TraceabilityStatusEnum.PROCESSING}'
      ORDER BY S.seq DESC
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [userCode, formSeq]);
    return rows[0] || null;
  }

  async getSubmissionByTraceabilityIdAndFormSeq(traceabilityId: string, formSeq: number, userCode?: string): Promise<RowDataPacket | null> {
    let sql = `
      SELECT S.seq, S.batchSeq, S.traceabilityCode, S.formSeq, S.userCode, S.formData, S.uniqueId, 
             B.status, B.qrUrl, B.traceabilityId, B.lotcode 
      FROM ${this.tableSubmissionsExt} S
      JOIN ${this.tableBatchesExt} B ON S.batchSeq = B.seq
      WHERE B.traceabilityId = ? AND S.formSeq = ? AND S.isActive = 'Y' AND B.isActive = 'Y'
    `;
    const params: any[] = [traceabilityId, formSeq];
    if (userCode) {
      sql += ` AND S.userCode = ?`;
      params.push(userCode);
    }
    sql += ` ORDER BY S.seq DESC LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, params);
    return rows[0] || null;
  }

  async getFilesByUniqueId(uniqueId: string): Promise<RowDataPacket[]> {
    const sql = `
      SELECT seq, submissionSeq, uniqueId, fieldKey, fieldType, filename, originalname, size, mimetype, sortOrder 
      FROM ${this.tableFileExt} 
      WHERE uniqueId = ? AND isActive = 'Y' 
      ORDER BY fieldKey ASC, sortOrder ASC
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);
    return rows;
  }

  async deactivateFilesForFieldSingle(uniqueId: string, fieldKey: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableFileExt} 
      SET isActive = 'N', updatedAt = NOW() 
      WHERE uniqueId = ? AND fieldKey = ? AND fieldType = 'file_single' AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [uniqueId, fieldKey]);
    return result.affectedRows;
  }

  async insertFile(uniqueId: string, fieldKey: string, fieldType: string, filename: string, originalname: string, size: number, mimetype: string, createdId: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableFileExt} 
        (submissionSeq, uniqueId, fieldKey, fieldType, filename, originalname, size, mimetype, createdId) 
      VALUES (0, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [uniqueId, fieldKey, fieldType, filename, originalname, size, mimetype, createdId]);
    return result.insertId;
  }

  async getFileBySeq(seq: number): Promise<RowDataPacket | null> {
    const sql = `SELECT seq, filename, createdId FROM ${this.tableFileExt} WHERE seq = ? LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [seq]);
    return rows[0] || null;
  }

  async deleteFileBySeq(seq: number): Promise<number> {
    const sql = `DELETE FROM ${this.tableFileExt} WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);
    return result.affectedRows;
  }

  async generateTraceabilityCode(): Promise<string> {
    const sqlLast = `SELECT traceabilityCode FROM ${this.tableSubmissionsExt} ORDER BY seq DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let traceabilityCode = CODES.traceabilityCodeExt.FIRST_CODE;
    if (rows.length > 0) {
      traceabilityCode = generateCode(rows[0].traceabilityCode, CODES.traceabilityCodeExt.PRE, CODES.traceabilityCodeExt.LEN);
    }
    return traceabilityCode;
  }

  async insertSubmission(batchSeq: number, traceabilityCode: string, formSeq: number, userCode: string, formData: string, uniqueId: string, createdId: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableSubmissionsExt} 
        (batchSeq, traceabilityCode, formSeq, userCode, formData, uniqueId, createdId) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [batchSeq, traceabilityCode, formSeq, userCode, formData, uniqueId, createdId]);
    return result.insertId;
  }

  async updateSubmission(seq: number, formData: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableSubmissionsExt} 
      SET formData = ?, updatedId = ?, updatedAt = NOW() 
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [formData, updatedId, seq]);
    return result.affectedRows;
  }

  async bindFilesToSubmission(submissionSeq: number, uniqueId: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableFileExt} 
      SET submissionSeq = ?, updatedId = ?, updatedAt = NOW() 
      WHERE uniqueId = ? AND submissionSeq = 0
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [submissionSeq, updatedId, uniqueId]);
    return result.affectedRows;
  }

  async checkExistUniqueId(uniqueId: string): Promise<boolean> {
    const sql = `SELECT seq FROM ${this.tableSubmissionsExt} WHERE uniqueId = ? LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);
    return rows.length > 0;
  }

  async getSubmissionByUniqueId(uniqueId: string): Promise<RowDataPacket | null> {
    const sql = `SELECT seq, batchSeq FROM ${this.tableSubmissionsExt} WHERE uniqueId = ? LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);
    return rows[0] || null;
  }

  async completeBatch(batchSeq: number, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableBatchesExt} 
      SET status = '${TraceabilityStatusEnum.APPROVED}', updatedId = ?, updatedAt = NOW() 
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [updatedId, batchSeq]);
    return result.affectedRows;
  }

  async getSubmissionBatchList(userCode: string, dto: GetSubmissionBatchListDto): Promise<{ list: RowDataPacket[]; total: number }> {
    const page = Number(dto.page) > 0 ? Number(dto.page) : 1;
    const limit = Number(dto.limit) > 0 ? Number(dto.limit) : 10;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['B.userCode = ?', "B.isActive = 'Y'"];
    const params: any[] = [userCode];

    const whereClause = conditions.join(' AND ');

    const countSql = `SELECT COUNT(B.seq) as total FROM ${this.tableBatchesExt} B WHERE ${whereClause}`;
    const [countRows] = await this.db.query<RowDataPacket[]>(countSql, params);
    const total = countRows[0]?.total || 0;

    const listSql = `
      SELECT B.seq, B.traceabilityId, B.userCode, B.status, B.qrUrl, B.lotcode, B.createdAt, B.updatedAt,
             (SELECT COUNT(seq) FROM ${this.tableSubmissionsExt} S WHERE S.batchSeq = B.seq AND S.isActive = 'Y') as submissionCount,
             (SELECT COUNT(seq) FROM ${this.tableSubmissionsExt} S WHERE S.batchSeq = B.seq AND S.formSeq = ${FINAL_FORM_SEQ} AND S.isActive = 'Y') as formFinalCount
      FROM ${this.tableBatchesExt} B
      WHERE ${whereClause}
      ORDER BY B.seq DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await this.db.query<RowDataPacket[]>(listSql, [...params, limit, offset]);
    return { list: rows, total };
  }

  async getFilesNotUse(): Promise<{ seq: number; filename: string }[]> {
    const sql = `
      SELECT seq, filename 
      FROM ${this.tableFileExt} 
      WHERE submissionSeq = 0 OR uniqueId NOT IN (SELECT uniqueId FROM ${this.tableSubmissionsExt} WHERE uniqueId IS NOT NULL)
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(sql);
    return rows as { seq: number; filename: string }[];
  }

  async deleteFileCron(seq: number): Promise<number> {
    return await this.deleteFileBySeq(seq);
  }

  async getSubmissionsFormDataByTraceabilityId(traceabilityId: string): Promise<any[]> {
    const sql = `
      SELECT S.formData 
      FROM ${this.tableSubmissionsExt} S
      JOIN ${this.tableBatchesExt} B ON S.batchSeq = B.seq
      WHERE B.traceabilityId = ? AND S.isActive = 'Y' AND B.isActive = 'Y'
      ORDER BY S.seq ASC
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [traceabilityId]);
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

  async getInternalBatchByLotcode(lotcode: string): Promise<RowDataPacket | null> {
    const sql = `
      SELECT seq, traceabilityId, userCode, userHomeCode, harvestPhases, lotcode 
      FROM ${this.tableBatchesInl} 
      WHERE lotcode = ? 
      ORDER BY seq DESC 
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [lotcode]);
    return rows[0] || null;
  }

  async getInternalSubmissionsForExtra(batchSeq: number): Promise<RowDataPacket[]> {
    const sql = `
      SELECT formSeq, formData 
      FROM ${this.tableSubmissionsInl} 
      WHERE batchSeq = ? AND formSeq IN (1, 3) AND isActive = 'Y'
      ORDER BY seq DESC
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [batchSeq]);
    return rows;
  }

  async getExtraLinkedByBatchExternalSeq(batchExternalSeq: number): Promise<RowDataPacket | null> {
    const sql = `
      SELECT seq, userCode, lotcode, batchExternalSeq, batchInternalSeq, formDataExtra, isActive 
      FROM ${this.tableBatchesExtraLinked} 
      WHERE batchExternalSeq = ? AND isActive = 'Y' 
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [batchExternalSeq]);
    return rows[0] || null;
  }

  async checkInternalBatchAlreadyLinked(batchInternalSeq: number, excludeBatchExternalSeq?: number | null): Promise<boolean> {
    let sql = `
      SELECT E.seq 
      FROM ${this.tableBatchesExtraLinked} E
      JOIN ${this.tableBatchesExt} B ON E.batchExternalSeq = B.seq
      WHERE E.batchInternalSeq = ? AND E.isActive = 'Y' AND B.isActive = 'Y'
    `;
    const params: any[] = [batchInternalSeq];
    if (excludeBatchExternalSeq) {
      sql += ` AND E.batchExternalSeq != ?`;
      params.push(excludeBatchExternalSeq);
    }
    sql += ` LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, params);
    return rows.length > 0;
  }

  async saveExtraLinked(userCode: string, batchExternalSeq: number, lotcode: string | null, batchInternalSeq: number | null, formDataExtra: string | null, userId: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableBatchesExtraLinked} 
        (userCode, batchExternalSeq, lotcode, batchInternalSeq, formDataExtra, createdId) 
      VALUES (?, ?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
        lotcode = VALUES(lotcode), 
        batchInternalSeq = VALUES(batchInternalSeq), 
        formDataExtra = VALUES(formDataExtra), 
        updatedId = ?, 
        updatedAt = NOW()
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, batchExternalSeq, lotcode, batchInternalSeq, formDataExtra, userId, userId]);
    return result.affectedRows;
  }
}

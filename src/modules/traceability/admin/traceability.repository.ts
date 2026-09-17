import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { GetTraceabilityListAdminDto } from './traceability-admin.dto';

@Injectable()
export class TraceabilityAdminRepository {
  private readonly tableForms = 'tbl_traceability_forms';
  private readonly tableGroups = 'tbl_traceability_forms_groups';
  private readonly tableFields = 'tbl_traceability_forms_fields';
  private readonly tableSubmissions = 'tbl_traceability_submissions';
  private readonly tableFile = 'tbl_traceability_file';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getAllForms(): Promise<RowDataPacket[]> {
    const sql = `SELECT seq, formKey, formName, formDescription, sortOrder FROM ${this.tableForms} WHERE isActive = 'Y' ORDER BY sortOrder ASC`;
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
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [Number(formSeq)]);
    return rows;
  }

  async getFieldsByFormSeq(formSeq: number): Promise<RowDataPacket[]> {
    const sql = `
      SELECT seq, groupSeq, fieldKey, fieldName, fieldType, isRequired, sortOrder, config 
      FROM ${this.tableFields} 
      WHERE formSeq = ? AND isActive = 'Y' 
      ORDER BY groupSeq ASC, sortOrder ASC
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [Number(formSeq)]);
    return rows;
  }

  async getBatchByTraceabilityId(traceabilityId: string): Promise<RowDataPacket | null> {
    const sql = `SELECT seq, traceabilityId, userCode, userHomeCode, status, qrUrl, harvestPhases FROM tbl_traceability_batches WHERE traceabilityId = ? AND isActive = 'Y' LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [traceabilityId]);
    return rows[0] || null;
  }

  async getSubmissionByTraceabilityIdAndFormSeq(traceabilityId: string, formSeq: number): Promise<RowDataPacket | null> {
    const sql = `
      SELECT S.seq, S.batchSeq, S.traceabilityCode, S.formSeq, S.userCode, S.userHomeCode, S.formData, S.uniqueId, 
             B.status, B.qrUrl, B.traceabilityId, B.harvestPhases 
      FROM ${this.tableSubmissions} S
      JOIN tbl_traceability_batches B ON S.batchSeq = B.seq
      WHERE B.traceabilityId = ? AND S.formSeq = ? AND S.isActive = 'Y' AND B.isActive = 'Y'
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [traceabilityId, Number(formSeq)]);
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

  async getHomeInfoByUserHomeCode(userHomeCode: string): Promise<RowDataPacket | null> {
    const sql = `
      SELECT H.userHomeCode, H.userHomeName, H.userHomeAddress, H.userHomeLength, H.userHomeWidth, H.userHomeFloor, U.userName 
      FROM tbl_user_home H 
      LEFT JOIN tbl_user_app U ON H.userCode = U.userCode 
      WHERE H.userHomeCode = ? AND H.isActive = 'Y' 
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [userHomeCode]);
    return rows[0] || null;
  }

  async getListTraceabilitySubmissions(dto: GetTraceabilityListAdminDto): Promise<RowDataPacket[]> {
    let sql = `
      SELECT 
        S.seq, S.batchSeq, S.traceabilityCode, S.formSeq, S.userCode, S.userHomeCode, 
        S.uniqueId, S.createdAt, S.updatedAt,
        B.status, B.qrUrl, B.traceabilityId, B.harvestPhases,
        F.formKey, F.formName,
        U.userName, U.userPhone,
        H.userHomeName, H.userHomeAddress
      FROM ${this.tableSubmissions} S
      JOIN tbl_traceability_batches B ON S.batchSeq = B.seq
      LEFT JOIN tbl_user_home H ON S.userHomeCode = H.userHomeCode
      LEFT JOIN tbl_user_app U ON S.userCode = U.userCode
      LEFT JOIN ${this.tableForms} F ON S.formSeq = F.seq
      WHERE S.isActive = 'Y' AND B.isActive = 'Y'
    `;
    const params: any[] = [];

    if (dto.keyword) {
      sql += ` AND (S.traceabilityCode LIKE ? OR B.traceabilityId LIKE ? OR U.userName LIKE ? OR U.userPhone LIKE ? OR H.userHomeName LIKE ?)`;
      const kw = `%${dto.keyword.trim()}%`;
      params.push(kw, kw, kw, kw, kw);
    }
    if (dto.formSeq) {
      sql += ` AND S.formSeq = ?`;
      params.push(Number(dto.formSeq));
    }
    if (dto.status) {
      sql += ` AND B.status = ?`;
      params.push(dto.status);
    }
    if (dto.fromDate) {
      sql += ` AND S.createdAt >= ?`;
      params.push(`${dto.fromDate} 00:00:00`);
    }
    if (dto.toDate) {
      sql += ` AND S.createdAt <= ?`;
      params.push(`${dto.toDate} 23:59:59`);
    }

    sql += ` ORDER BY S.seq DESC`;

    const page = dto.page && Number(dto.page) > 0 ? Number(dto.page) : 1;
    const limit = dto.limit && Number(dto.limit) > 0 ? Number(dto.limit) : 10;
    const offset = (page - 1) * limit;

    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await this.db.query<RowDataPacket[]>(sql, params);
    return rows;
  }

  async getTotalTraceabilitySubmissions(dto: GetTraceabilityListAdminDto): Promise<number> {
    let sql = `
      SELECT COUNT(S.seq) as total
      FROM ${this.tableSubmissions} S
      JOIN tbl_traceability_batches B ON S.batchSeq = B.seq
      LEFT JOIN tbl_user_home H ON S.userHomeCode = H.userHomeCode
      LEFT JOIN tbl_user_app U ON S.userCode = U.userCode
      LEFT JOIN ${this.tableForms} F ON S.formSeq = F.seq
      WHERE S.isActive = 'Y' AND B.isActive = 'Y'
    `;
    const params: any[] = [];

    if (dto.keyword) {
      sql += ` AND (S.traceabilityCode LIKE ? OR B.traceabilityId LIKE ? OR U.userName LIKE ? OR U.userPhone LIKE ? OR H.userHomeName LIKE ?)`;
      const kw = `%${dto.keyword.trim()}%`;
      params.push(kw, kw, kw, kw, kw);
    }
    if (dto.formSeq) {
      sql += ` AND S.formSeq = ?`;
      params.push(Number(dto.formSeq));
    }
    if (dto.status) {
      sql += ` AND B.status = ?`;
      params.push(dto.status);
    }
    if (dto.fromDate) {
      sql += ` AND S.createdAt >= ?`;
      params.push(`${dto.fromDate} 00:00:00`);
    }
    if (dto.toDate) {
      sql += ` AND S.createdAt <= ?`;
      params.push(`${dto.toDate} 23:59:59`);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(sql, params);
    return rows[0]?.total || 0;
  }

  async updateSubmissionStatus(seq: number, status: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE tbl_traceability_batches
      SET status = ?, updatedId = ?, updatedAt = NOW()
      WHERE seq = (
        SELECT batchSeq FROM ${this.tableSubmissions} WHERE seq = ?
      ) OR seq = ?
    `;
    const [result] = await this.db.execute<any>(sql, [status, updatedId, Number(seq), Number(seq)]);
    return result.affectedRows || 0;
  }
}

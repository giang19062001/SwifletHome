import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';

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

  async getSubmissionByTraceabilityIdAndFormSeq(traceabilityId: string, formSeq: number): Promise<RowDataPacket | null> {
    const sql = `
      SELECT seq, traceabilityCode, formSeq, userCode, userHomeCode, formData, uniqueId, status, qrUrl, traceabilityId 
      FROM ${this.tableSubmissions} 
      WHERE traceabilityId = ? AND formSeq = ? AND isActive = 'Y' 
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [traceabilityId, formSeq]);
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
}

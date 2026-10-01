import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { FINAL_FORM_SEQ } from '../common/traceability.const';
import { GetTraceabilityListAdminDto } from './traceability-admin.dto';
import { TraceabilityDisplayActorTypeEnum, TraceabilityStatusEnum } from '../common/traceability.enum';

@Injectable()
export class TraceabilityAdminRepository {
  private readonly tableForms = 'tbl_traceability_forms';
  private readonly tableGroups = 'tbl_traceability_forms_groups';
  private readonly tableFields = 'tbl_traceability_forms_fields';
  private readonly tableSubmissions = 'tbl_traceability_submissions';
  private readonly tableSubmissionsExt = 'tbl_traceability_submissions_external';
  private readonly tableFile = 'tbl_traceability_file';
  private readonly tableFileExt = 'tbl_traceability_file_external';
  private readonly tableBatches = 'tbl_traceability_batches';
  private readonly tableBatchesExt = 'tbl_traceability_batches_external';
  private readonly tableUserHomes = 'tbl_user_home';
  private readonly tableUserApps = 'tbl_user_app';
  private readonly tableHarvestPhase = 'tbl_todo_task_harvest_phase';
  private readonly tableTaskHarvest = 'tbl_todo_task_harvest';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getAllForms(): Promise<RowDataPacket[]> {
    const sql = `SELECT seq, formKey, formName, formDescription, sortOrder, displayActorType FROM ${this.tableForms} WHERE isActive = 'Y' ORDER BY sortOrder ASC`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql);
    return rows;
  }

  async getGroupsByFormSeq(formSeq: number): Promise<RowDataPacket[]> {
    const sql = `
      SELECT seq, groupKey, groupName, isLoop
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
    const sql = `SELECT seq, traceabilityId, userCode, userHomeCode, status, qrUrl, harvestPhases, lotcode FROM ${this.tableBatches} WHERE traceabilityId = ? AND isActive = 'Y' LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [traceabilityId]);
    return rows[0] || null;
  }

  async getBatchByTraceabilityIdExternal(traceabilityId: string): Promise<RowDataPacket | null> {
    const sql = `SELECT seq, traceabilityId, userCode, status, qrUrl, lotcode FROM ${this.tableBatchesExt} WHERE traceabilityId = ? AND isActive = 'Y' LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [traceabilityId]);
    return rows[0] || null;
  }

  async getSubmissionByTraceabilityIdAndFormSeq(traceabilityId: string, formSeq: number): Promise<RowDataPacket | null> {
    const sql = `
      SELECT S.seq, S.batchSeq, S.traceabilityCode, S.formSeq, S.userCode, S.userHomeCode, S.formData, S.uniqueId,
             B.status, B.qrUrl, B.traceabilityId, B.harvestPhases
      FROM ${this.tableSubmissions} S
      JOIN ${this.tableBatches} B ON S.batchSeq = B.seq
      WHERE B.traceabilityId = ? AND S.formSeq = ? AND S.isActive = 'Y' AND B.isActive = 'Y'
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [traceabilityId, Number(formSeq)]);
    return rows[0] || null;
  }

  async getSubmissionByTraceabilityIdAndFormSeqExternal(traceabilityId: string, formSeq: number): Promise<RowDataPacket | null> {
    const sql = `
      SELECT S.seq, S.batchSeq, S.traceabilityCode, S.formSeq, S.userCode, S.formData, S.uniqueId,
             B.status, B.qrUrl, B.traceabilityId
      FROM ${this.tableSubmissionsExt} S
      JOIN ${this.tableBatchesExt} B ON S.batchSeq = B.seq
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

  async getFilesByUniqueIdExternal(uniqueId: string): Promise<RowDataPacket[]> {
    const sql = `
      SELECT seq, submissionSeq, uniqueId, fieldKey, fieldType, filename, originalname, size, mimetype, sortOrder
      FROM ${this.tableFileExt}
      WHERE uniqueId = ? AND isActive = 'Y'
      ORDER BY fieldKey ASC, sortOrder ASC
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);
    return rows;
  }

  async getHomeInfoByUserHomeCode(userHomeCode: string): Promise<RowDataPacket | null> {
    const sql = `
      SELECT H.userHomeCode, H.userHomeName, H.userHomeAddress, H.userHomeLength, H.userHomeWidth, H.userHomeFloor, U.userName
      FROM ${this.tableUserHomes} H
      LEFT JOIN ${this.tableUserApps} U ON H.userCode = U.userCode
      WHERE H.userHomeCode = ? AND H.isActive = 'Y'
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [userHomeCode]);
    return rows[0] || null;
  }

  async getListTraceabilitySubmissions(dto: GetTraceabilityListAdminDto): Promise<RowDataPacket[]> {
    const page = dto.page && Number(dto.page) > 0 ? Number(dto.page) : 1;
    const limit = dto.limit && Number(dto.limit) > 0 ? Number(dto.limit) : 10;
    const offset = (page - 1) * limit;

    const unionSql = `
      SELECT
        B.seq, B.traceabilityId, B.userCode, B.userHomeCode,
        B.status, B.qrUrl, B.harvestPhases, B.createdAt, B.updatedAt,
        U.userName, U.userPhone,
        H.userHomeName, H.userHomeAddress,
        0 AS isExternal,
        'INTERNAL' AS batchType,
        EXISTS (
          SELECT 1 FROM ${this.tableSubmissions} Sfinal
          WHERE Sfinal.batchSeq = B.seq AND Sfinal.formSeq = ${FINAL_FORM_SEQ} AND Sfinal.isActive = 'Y'
        ) AS hasFinalForm
      FROM ${this.tableBatches} B
      LEFT JOIN ${this.tableUserHomes} H ON B.userHomeCode = H.userHomeCode
      LEFT JOIN ${this.tableUserApps} U ON B.userCode = U.userCode
      WHERE B.isActive = 'Y'

      UNION ALL

      SELECT
        B.seq, B.traceabilityId, B.userCode, NULL AS userHomeCode,
        B.status, B.qrUrl, NULL AS harvestPhases, B.createdAt, B.updatedAt,
        U.userName, U.userPhone,
        NULL AS userHomeName, NULL AS userHomeAddress,
        1 AS isExternal,
        '${TraceabilityDisplayActorTypeEnum.EXTERNAL}' AS batchType,
        EXISTS (
          SELECT 1 FROM ${this.tableSubmissionsExt} Sfinal
          WHERE Sfinal.batchSeq = B.seq AND Sfinal.formSeq = ${FINAL_FORM_SEQ} AND Sfinal.isActive = 'Y'
        ) AS hasFinalForm
      FROM ${this.tableBatchesExt} B
      LEFT JOIN ${this.tableUserApps} U ON B.userCode = U.userCode
      WHERE B.isActive = 'Y'
    `;

    let sql = `SELECT * FROM (${unionSql}) AS T WHERE 1=1`;
    const params: any[] = [];

    if (dto.keyword) {
      sql += ` AND (T.traceabilityId LIKE ? OR T.userName LIKE ? OR T.userPhone LIKE ? OR T.userHomeName LIKE ? OR T.userHomeCode LIKE ?)`;
      const kw = `%${dto.keyword.trim()}%`;
      params.push(kw, kw, kw, kw, kw);
    }
    if (dto.type && dto.type !== 'ALL') {
      const type = String(dto.type);
      if (type === String(TraceabilityDisplayActorTypeEnum.EXTERNAL)) {
        sql += ` AND T.isExternal = 1`;
      } else if (type === String(TraceabilityDisplayActorTypeEnum.INTERNAL)) {
        sql += ` AND T.isExternal = 0`;
      }
    }
    if (dto.status) {
      sql += ` AND T.status = ?`;
      params.push(dto.status);
    }
    if (dto.fromDate) {
      sql += ` AND T.createdAt >= ?`;
      params.push(`${dto.fromDate} 00:00:00`);
    }
    if (dto.toDate) {
      sql += ` AND T.createdAt <= ?`;
      params.push(`${dto.toDate} 23:59:59`);
    }
    if (dto.formSeq) {
      sql += ` AND (
        (T.isExternal = 0 AND EXISTS (SELECT 1 FROM ${this.tableSubmissions} S WHERE S.batchSeq = T.seq AND S.formSeq = ? AND S.isActive = 'Y'))
        OR
        (T.isExternal = 1 AND EXISTS (SELECT 1 FROM ${this.tableSubmissionsExt} S WHERE S.batchSeq = T.seq AND S.formSeq = ? AND S.isActive = 'Y'))
      )`;
      params.push(Number(dto.formSeq), Number(dto.formSeq));
    }

    sql += ` ORDER BY T.createdAt DESC, T.seq DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await this.db.query<RowDataPacket[]>(sql, params);
    return rows;
  }

  async getTotalTraceabilitySubmissions(dto: GetTraceabilityListAdminDto): Promise<number> {
    const unionSql = `
      SELECT
        B.seq, B.traceabilityId, B.userCode, B.userHomeCode,
        B.status, B.createdAt,
        U.userName, U.userPhone,
        H.userHomeName,
        0 AS isExternal
      FROM ${this.tableBatches} B
      LEFT JOIN ${this.tableUserHomes} H ON B.userHomeCode = H.userHomeCode
      LEFT JOIN ${this.tableUserApps} U ON B.userCode = U.userCode
      WHERE B.isActive = 'Y'

      UNION ALL

      SELECT
        B.seq, B.traceabilityId, B.userCode, NULL AS userHomeCode,
        B.status, B.createdAt,
        U.userName, U.userPhone,
        NULL AS userHomeName,
        1 AS isExternal
      FROM ${this.tableBatchesExt} B
      LEFT JOIN ${this.tableUserApps} U ON B.userCode = U.userCode
      WHERE B.isActive = 'Y'
    `;

    let sql = `SELECT COUNT(1) as total FROM (${unionSql}) AS T WHERE 1=1`;
    const params: any[] = [];

    if (dto.keyword) {
      sql += ` AND (T.traceabilityId LIKE ? OR T.userName LIKE ? OR T.userPhone LIKE ? OR T.userHomeName LIKE ? OR T.userHomeCode LIKE ?)`;
      const kw = `%${dto.keyword.trim()}%`;
      params.push(kw, kw, kw, kw, kw);
    }
    if (dto.type && dto.type !== 'ALL') {
      const type = String(dto.type);
      if (type === String(TraceabilityDisplayActorTypeEnum.EXTERNAL)) {
        sql += ` AND T.isExternal = 1`;
      } else if (type === String(TraceabilityDisplayActorTypeEnum.INTERNAL)) {
        sql += ` AND T.isExternal = 0`;
      }
    }
    if (dto.status) {
      sql += ` AND T.status = ?`;
      params.push(dto.status);
    }
    if (dto.fromDate) {
      sql += ` AND T.createdAt >= ?`;
      params.push(`${dto.fromDate} 00:00:00`);
    }
    if (dto.toDate) {
      sql += ` AND T.createdAt <= ?`;
      params.push(`${dto.toDate} 23:59:59`);
    }
    if (dto.formSeq) {
      sql += ` AND (
        (T.isExternal = 0 AND EXISTS (SELECT 1 FROM ${this.tableSubmissions} S WHERE S.batchSeq = T.seq AND S.formSeq = ? AND S.isActive = 'Y'))
        OR
        (T.isExternal = 1 AND EXISTS (SELECT 1 FROM ${this.tableSubmissionsExt} S WHERE S.batchSeq = T.seq AND S.formSeq = ? AND S.isActive = 'Y'))
      )`;
      params.push(Number(dto.formSeq), Number(dto.formSeq));
    }

    const [rows] = await this.db.query<RowDataPacket[]>(sql, params);
    return rows[0]?.total || 0;
  }

  async getBatchBySeq(seq: number): Promise<RowDataPacket | null> {
    const sql = `
      SELECT seq, traceabilityId, userCode, userHomeCode, status, qrUrl, harvestPhases
      FROM ${this.tableBatches}
      WHERE seq = ? AND isActive = 'Y'
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [Number(seq)]);
    return rows[0] || null;
  }

  async updateSubmissionStatus(seq: number, status: TraceabilityStatusEnum, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableBatches}
      SET status = ?, updatedId = ?, updatedAt = NOW()
      WHERE seq = ? AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<any>(sql, [status, updatedId, Number(seq)]);
    return result.affectedRows || 0;
  }

  async updateSubmissionStatusExternal(seq: number, status: TraceabilityStatusEnum, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableBatchesExt}
      SET status = ?, updatedId = ?, updatedAt = NOW()
      WHERE seq = ? AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<any>(sql, [status, updatedId, Number(seq)]);
    return result.affectedRows || 0;
  }

  async getHarvestPhasesInfo(userCode: string, userHomeCode: string, phases: number[]): Promise<RowDataPacket[]> {
    if (!phases || phases.length === 0) return [];
    const placeholders = phases.map(() => '?').join(',');
    const sql = `
      SELECT
        B.harvestPhase AS value,
        CAST(SUM(COALESCE(C.cellCollected, 0)) AS SIGNED) AS cellCollected,
        CONCAT(
          'Đợt ', B.harvestPhase,
          ' - ',
          CAST(SUM(COALESCE(C.cellCollected, 0)) AS SIGNED),
          ' Tổ - Ngày thu hoạch ',
          DATE_FORMAT(B.createdAt, '%Y/%m/%d')
        ) AS label
      FROM ${this.tableUserHomes} A
      LEFT JOIN ${this.tableHarvestPhase} B
        ON A.userCode = B.userCode
        AND A.userHomeCode = B.userHomeCode
      LEFT JOIN ${this.tableTaskHarvest} C
        ON B.seq = C.seqHarvestPhase
      WHERE B.seq IS NOT NULL
        AND A.userCode = ?
        AND A.userHomeCode = ?
        AND B.harvestPhase IN (${placeholders})
      GROUP BY
        B.harvestPhase,
        B.createdAt,
        B.updatedAt
      ORDER BY B.harvestPhase ASC
    `;
    const params = [userCode, userHomeCode, ...phases];
    const [rows] = await this.db.query<RowDataPacket[]>(sql, params);
    return rows;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import moment from 'moment';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { YnEnum } from 'src/interfaces/admin.interface';
import { TaskHarvestQrResDto } from 'src/modules/qr/app/qr.response';
import { TaskStatusEnum } from '../todo.interface';
import { GetListTaskHarvestForAdjustDto, HarvestDataRowInputDto } from './todo.dto';
import { GetHarvestTaskPhaseResDto, GetListTaskHarvestResDto } from './todo.response';

@Injectable()
export class TodoHarvestAppRepository {
  private readonly tableTaskHarvest = 'tbl_todo_task_harvest';
  private readonly tableTaskHarvestPhase = 'tbl_todo_task_harvest_phase';
  private readonly tableUserApp = 'tbl_user_app';
  private readonly tableUserHome = 'tbl_user_home';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  // ─── HARVEST PHASE ────────────────────────────────────────────────────────

  async getMaxHarvestPhase(userHomeCode: string): Promise<number> {
    const currentYear = moment().year();
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT MAX(harvestPhase) AS PHASE
       FROM ${this.tableTaskHarvestPhase}
       WHERE userHomeCode = ? AND harvestYear = ? AND taskStatus = '${TaskStatusEnum.COMPLETE}'`,
      [userHomeCode, currentYear],
    );
    return rows.length ? Number(rows[0].PHASE + 1) : 1;
  }

  async insertTaskHarvestPhase(userCode: string, userHomeCode: string, harvestPhase: number, isUse: YnEnum, taskDate: Date, taskStatus: TaskStatusEnum, harvestYear?: number): Promise<number> {
    const currentYear = harvestYear || moment().year();

    // 1. Kiểm tra xem đã có record tương tự chưa
    const [existing] = await this.db.query<RowDataPacket[]>(
      `SELECT seq FROM ${this.tableTaskHarvestPhase}
       WHERE userCode = ? AND userHomeCode = ? AND harvestPhase = ? AND harvestYear = ? LIMIT 1`,
      [userCode, userHomeCode, harvestPhase, currentYear],
    );

    if (existing.length > 0) {
      const seq = existing[0].seq;

      // 2. Nếu có, "xóa" (soft delete) các record con liên quan trong tbl_todo_task_harvest
      await this.db.execute(
        `UPDATE ${this.tableTaskHarvest}
         SET isActive = 'N', updatedId = ?, updatedAt = NOW()
         WHERE seqHarvestPhase = ? AND isActive = 'Y'`,
        [userCode, seq],
      );

      // 3. Ghi đè (update) record hiện tại
      const sqlUpdate = `
        UPDATE ${this.tableTaskHarvestPhase}
        SET isUse = ?, taskDate = ?, taskStatus = ?, updatedId = ?, updatedAt = NOW()
        WHERE seq = ?
      `;
      await this.db.execute(sqlUpdate, [isUse, taskDate, taskStatus, userCode, seq]);

      return seq;
    } else {
      // 4. Nếu không có, thêm mới như bình thường
      const sqlInsert = `
        INSERT INTO ${this.tableTaskHarvestPhase} (userCode, userHomeCode, harvestPhase, isUse, harvestYear, taskDate, taskStatus, createdId)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await this.db.execute<ResultSetHeader>(sqlInsert, [userCode, userHomeCode, harvestPhase, isUse, currentYear, taskDate, taskStatus, userCode]);
      return result.insertId;
    }
  }

  async completeTaskHarvestPhase(userCode: string, userHomeCode: string, seqHarvestPhase: number, harvestPhase: number): Promise<number> {
    const currentYear = moment().year();
    const sql = `
      UPDATE ${this.tableTaskHarvestPhase}
      SET taskStatus = ?, updatedId = ?, updatedAt = NOW()
      WHERE seq = ? AND harvestYear = ? AND harvestPhase = ? AND userHomeCode = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [TaskStatusEnum.COMPLETE, userCode, seqHarvestPhase, currentYear, harvestPhase, userHomeCode]);
    return result.affectedRows;
  }

  async useTaskHarvestForQr(userCode: string, userHomeCode: string, seqHarvestPhase: number): Promise<number> {
    const sql = `
      UPDATE ${this.tableTaskHarvestPhase}
      SET isUse = 'Y', updatedId = ?
      WHERE seq = ? AND userHomeCode = ? AND userCode = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, seqHarvestPhase, userHomeCode, userCode]);
    return result.affectedRows;
  }

  async unuseTaskHarvestForQr(userCode: string, userHomeCode: string, seqHarvestPhase: number): Promise<number> {
    const sql = `
      UPDATE ${this.tableTaskHarvestPhase}
      SET isUse = 'N', updatedId = ?
      WHERE seq = ? AND userHomeCode = ? AND userCode = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, seqHarvestPhase, userHomeCode, userCode]);
    return result.affectedRows;
  }

  async changeHarvestStatus(userCode: string, seqHarvestPhase: number, taskStatus: TaskStatusEnum): Promise<number> {
    const sql = `
      UPDATE ${this.tableTaskHarvestPhase}
      SET taskStatus = ?, updatedId = ?, updatedAt = NOW()
      WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [taskStatus, userCode, seqHarvestPhase]);
    return result.affectedRows;
  }

  async updateTaskHarvestDate(userCode: string, seqHarvestPhase: number, taskDate: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableTaskHarvestPhase}
      SET taskDate = ?, updatedId = ?, updatedAt = NOW()
      WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [taskDate, userCode, seqHarvestPhase]);
    return result.affectedRows;
  }

  async updateWaitingTaskHarvestPhase(seq: number, harvestPhase: number, harvestYear: number, taskDate: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableTaskHarvestPhase}
      SET harvestPhase = ?, harvestYear = ?, taskDate = ?, updatedAt = NOW()
      WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [harvestPhase, harvestYear, taskDate, seq]);
    return result.affectedRows;
  }

  async getWaitingTaskHarvestPhase(userHomeCode: string): Promise<{ seq: number; harvestPhase: number; harvestYear: number } | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT seq, harvestPhase, harvestYear
       FROM ${this.tableTaskHarvestPhase}
       WHERE userHomeCode = ? AND taskStatus = '${TaskStatusEnum.WAITING}'
       LIMIT 1`,
      [userHomeCode],
    );
    return rows.length ? (rows[0] as { seq: number; harvestPhase: number; harvestYear: number }) : null;
  }

  /** Lấy lịch thu hoạch WAITING gần nhất để hiển thị 4 Box */
  async getNextHarvestSchedule(userCode: string, userHomeCode: string, today: string): Promise<{ seq: number; taskDate: string; taskStatus: string } | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT seq, DATE_FORMAT(taskDate, '%Y-%m-%d') AS taskDate, taskStatus
       FROM ${this.tableTaskHarvestPhase}
       WHERE userCode = ? AND userHomeCode = ?
         AND taskStatus = '${TaskStatusEnum.WAITING}'
         AND taskDate >= ?
       ORDER BY taskDate ASC
       LIMIT 1`,
      [userCode, userHomeCode, today],
    );
    return rows.length ? (rows[0] as { seq: number; taskDate: string; taskStatus: string }) : null;
  }

  async getOneTaskHarvestPhase(seqHarvestPhase: number): Promise<GetHarvestTaskPhaseResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT seq, userCode, userHomeCode, harvestPhase, harvestYear, isUse,
              DATE_FORMAT(taskDate,'%Y-%m-%d') AS taskDate, taskStatus
       FROM ${this.tableTaskHarvestPhase}
       WHERE seq = ? LIMIT 1`,
      [seqHarvestPhase],
    );
    return rows.length ? (rows[0] as GetHarvestTaskPhaseResDto) : null;
  }

  // ─── HARVEST ROWS ─────────────────────────────────────────────────────────

  async getTaskHarvestRows(seqHarvestPhase: number, isOnlyActive: boolean): Promise<HarvestDataRowInputDto[]> {
    const sql = `
      SELECT B.seqHarvestPhase, B.userCode, B.userHomeCode, B.floor, B.cell, B.cellCollected, B.cellRemain
      FROM ${this.tableTaskHarvestPhase} A
      LEFT JOIN ${this.tableTaskHarvest} B ON A.seq = B.seqHarvestPhase
      WHERE A.seq = ?
      ${isOnlyActive ? `AND B.isActive = 'Y'` : ''}`;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, [seqHarvestPhase]);
    return rows as HarvestDataRowInputDto[];
  }

  async getMultipleTaskHarvestRows(seqHarvestPhases: number[], isOnlyActive: boolean): Promise<HarvestDataRowInputDto[]> {
    if (!seqHarvestPhases || seqHarvestPhases.length === 0) return [];
    const placeholders = seqHarvestPhases.map(() => '?').join(',');
    const sql = `
      SELECT B.seqHarvestPhase, B.userCode, B.userHomeCode, B.floor, B.cell, B.cellCollected, B.cellRemain
      FROM ${this.tableTaskHarvestPhase} A
      LEFT JOIN ${this.tableTaskHarvest} B ON A.seq = B.seqHarvestPhase
      WHERE A.seq IN (${placeholders})
      ${isOnlyActive ? `AND B.isActive = 'Y'` : ''}`;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, seqHarvestPhases);
    return rows as HarvestDataRowInputDto[];
  }

  async insertTaskHarvestRows(dto: HarvestDataRowInputDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableTaskHarvest} (seqHarvestPhase, userCode, userHomeCode, floor, cell, cellCollected, cellRemain, createdId)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.seqHarvestPhase, dto.userCode, dto.userHomeCode, dto.floor, dto.cell, dto.cellCollected, dto.cellRemain, dto.userCode]);
    return result.insertId;
  }

  async insertMultipleTaskHarvestRows(dtos: HarvestDataRowInputDto[]): Promise<number> {
    if (!dtos || !dtos.length) return 0;
    const sql = `
      INSERT INTO ${this.tableTaskHarvest} (seqHarvestPhase, userCode, userHomeCode, floor, cell, cellCollected, cellRemain, createdId)
      VALUES ${dtos.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}
    `;
    const params = dtos.flatMap((dto) => [dto.seqHarvestPhase, dto.userCode, dto.userHomeCode, dto.floor, dto.cell, dto.cellCollected, dto.cellRemain, dto.userCode]);
    const [result] = await this.db.execute<ResultSetHeader>(sql, params);
    return result.affectedRows;
  }

  async updateTaskHarvestRows(dto: HarvestDataRowInputDto): Promise<number> {
    const sql = `
      UPDATE ${this.tableTaskHarvest}
      SET cellCollected = ?, cellRemain = ?, updatedId = ?, updatedAt = NOW(), isActive = 'Y'
      WHERE seqHarvestPhase = ? AND userCode = ? AND userHomeCode = ? AND floor = ? AND cell = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.cellCollected, dto.cellRemain, dto.userCode, dto.seqHarvestPhase, dto.userCode, dto.userHomeCode, dto.floor, dto.cell]);
    return result.affectedRows;
  }

  async deleteTaskHarvestRows(seqHarvestPhase: number, floor: number, cell: number, userCode: string, userHomeCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableTaskHarvest}
      SET isActive = 'N', updatedId = ?, updatedAt = NOW()
      WHERE seqHarvestPhase = ? AND userCode = ? AND userHomeCode = ? AND floor = ? AND cell = ? AND isActive = 'Y'`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, seqHarvestPhase, userCode, userHomeCode, floor, cell]);
    return result.affectedRows;
  }

  async deleteMultipleTaskHarvestRows(dtos: HarvestDataRowInputDto[]): Promise<number> {
    if (!dtos || !dtos.length) return 0;
    const placeholders = dtos.map(() => "(seqHarvestPhase = ? AND userCode = ? AND userHomeCode = ? AND floor = ? AND cell = ? AND isActive = 'Y')").join(' OR ');
    const sql = `
      UPDATE ${this.tableTaskHarvest}
      SET isActive = 'N', updatedId = ?, updatedAt = NOW()
      WHERE ${placeholders}
    `;
    const params: (string | number)[] = [dtos[0].userCode];
    for (const dto of dtos) {
      params.push(dto.seqHarvestPhase, dto.userCode, dto.userHomeCode, dto.floor, dto.cell);
    }
    const [result] = await this.db.execute<ResultSetHeader>(sql, params);
    return result.affectedRows;
  }

  // ─── HARVEST FOR QR ───────────────────────────────────────────────────────

  async getTotalTaskHarvestForAdjust(dto: GetListTaskHarvestForAdjustDto, userCode: string): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(A.seq) AS TOTAL
       FROM ${this.tableTaskHarvestPhase} A
       WHERE A.userHomeCode = ? AND A.userCode = ? AND A.taskStatus = '${TaskStatusEnum.COMPLETE}' AND A.isUse = 'N'`,
      [dto.userHomeCode, userCode],
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }

  async getListTaskHarvestForAdjust(dto: GetListTaskHarvestForAdjustDto, userCode: string): Promise<GetListTaskHarvestResDto[]> {
    const params: (string | number)[] = [dto.userHomeCode, userCode];
    let offsetQuery = '';
    if (dto.limit != 0 && dto.page != 0) {
      offsetQuery = `LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }
    const query = `
      SELECT
        A.seq, A.userHomeCode, A.harvestPhase, A.harvestYear,
        E.userHomeFloor AS totalFloor,
        CAST(IFNULL(SUM(D.cellCollected), 0) AS SIGNED) AS totalCellCollected,
        CAST(IFNULL(SUM(D.cellRemain), 0) AS SIGNED) AS totalCellRemain
      FROM ${this.tableTaskHarvestPhase} A
      INNER JOIN ${this.tableUserHome} E ON A.userHomeCode = E.userHomeCode
      LEFT JOIN ${this.tableTaskHarvest} D ON A.seq = D.seqHarvestPhase
      WHERE A.userHomeCode = ? AND A.userCode = ? AND A.taskStatus = '${TaskStatusEnum.COMPLETE}' AND A.isUse = 'N'
      GROUP BY A.seq, A.userHomeCode, A.harvestPhase, A.harvestYear, E.userHomeFloor
      ${offsetQuery}`;
    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as GetListTaskHarvestResDto[];
  }

  async getTaskHarvestCompleteAndNotUseList(userHomeCode: string, harvestPhase: number): Promise<(TaskHarvestQrResDto & { seq: number; timestamp: Date })[]> {
    const currentYear = moment().year();
    const query = `
      SELECT A.seq AS seq, A.seq AS seqHarvestPhase, A.harvestPhase, A.harvestYear, COALESCE(A.updatedAt, A.createdAt) AS timestamp
      FROM ${this.tableTaskHarvestPhase} A
      WHERE A.userHomeCode = ? AND A.taskStatus = '${TaskStatusEnum.COMPLETE}' AND A.isUse = 'N'
        AND A.harvestYear = ?
      ${harvestPhase != 0 ? 'AND A.harvestPhase = ?' : ''}`;
    const [rows] = await this.db.query<RowDataPacket[]>(query, harvestPhase != 0 ? [userHomeCode, currentYear, harvestPhase] : [userHomeCode, currentYear]);
    return rows as (TaskHarvestQrResDto & { seq: number; timestamp: Date })[];
  }

  async checkTaskHarvestCompleteAndNotUse(seqHarvestPhase: number): Promise<boolean> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT seq FROM ${this.tableTaskHarvestPhase}
       WHERE seq = ? AND taskStatus = '${TaskStatusEnum.COMPLETE}' AND isUse = 'N'
       LIMIT 1`,
      [seqHarvestPhase],
    );
    return rows.length > 0;
  }

  async getTaskHarvestCompleteAndNotUseOne(userHomeCode: string, harvestPhase: number, harvestYear: number): Promise<(TaskHarvestQrResDto & { seq: number }) | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT seq AS seq, seq AS seqHarvestPhase, harvestPhase, harvestYear
       FROM ${this.tableTaskHarvestPhase}
       WHERE userHomeCode = ? AND taskStatus = '${TaskStatusEnum.COMPLETE}' AND isUse = 'N'
         AND harvestYear = ? AND harvestPhase = ?
       LIMIT 1`,
      [userHomeCode, harvestYear, harvestPhase],
    );
    return rows.length ? (rows[0] as TaskHarvestQrResDto & { seq: number }) : null;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import moment from 'moment';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { YnEnum } from 'src/interfaces/admin.interface';
import { TaskHarvestQrResDto, TaskMedicineQrResDto } from 'src/modules/qr/app/qr.response';
import { TODO_CONST } from '../todo.interface';
import { GetListTaskHarvestForAdjustDto, HarvestDataRowInputDto, SetTaskMedicineDto } from './todo.dto';
import { GetHarvestTaskPhaseResDto, GetListTaskHarvestResDto, GetTaskAlarmResDto, GetTasksMedicineRowResDto } from './todo.response';

@Injectable()
export class TodoHarvestMedicineAppRepository {
  private readonly tableTask = 'tbl_todo_tasks';
  private readonly tableTaskAlarm = 'tbl_todo_task_alarm';
  private readonly tableTaskMedicine = 'tbl_todo_task_medicine';
  private readonly tableTaskHarvest = 'tbl_todo_task_harvest';
  private readonly tableTaskHarvestPhase = 'tbl_todo_task_harvest_phase';
  private readonly tableOption = 'tbl_option_common';
  private readonly tableQr = 'tbl_qr_request';
  private readonly tableUserHome = 'tbl_user_home';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  // TODO: MEDICINE
  async getTaskMedicine(taskAlarmCode: string): Promise<(GetTaskAlarmResDto & GetTasksMedicineRowResDto) | null> {
    let query = `  
      SELECT A.taskAlarmCode, A.taskCode, C.taskKeyword, A.taskName, A.taskDate, A.taskStatus, A.taskNote,
        B.seq, B.seqNextTime, B.userCode, B.userHomeCode, B.medicineOptionCode, B.medicineOther, B.medicineUsage
        FROM ${this.tableTaskAlarm} A
        LEFT JOIN ${this.tableTaskMedicine} B
        ON A.seq = B.seqNextTime
        LEFT JOIN ${this.tableTask} C
        ON A.taskCode = C.taskCode
        WHERE taskAlarmCode  = ?  AND C.taskKeyword = '${TODO_CONST.TASK_EVENT.MEDICINE.value}' 
        AND B.isUse = 'N'
        LIMIT 1 `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskAlarmCode]);
    return rows.length ? (rows[0] as GetTaskAlarmResDto & GetTasksMedicineRowResDto) : null;
  }

  async insertTaskMedicine(userCode: string, userHomeCode: string, seqNextTime: number, dto: SetTaskMedicineDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableTaskMedicine}  (seqNextTime, userCode, userHomeCode, medicineOptionCode, medicineOther, medicineUsage, createdId, isUse) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seqNextTime, userCode, userHomeCode, dto.medicineOptionCode, dto.medicineOther, dto.medicineUsage, userCode, 'N']);
    return result.insertId;
  }

  async updateTaskMedicine(userCode: string, userHomeCode: string, taskAlarmCode: string, dto: SetTaskMedicineDto): Promise<number> {
    const sql = `
        UPDATE ${this.tableTaskMedicine} A
        LEFT JOIN ${this.tableTaskAlarm} B
          ON A.seqNextTime = B.seq
        SET 
          A.medicineOptionCode = ?, A.medicineOther = ?, medicineUsage = ?, A.updatedId = ?, A.updatedAt = NOW()
        WHERE 
          B.taskAlarmCode = ?
          AND A.userCode = ?
          AND A.userHomeCode = ? `;
    const params = [dto.medicineOptionCode, dto.medicineOther, dto.medicineUsage, userCode, taskAlarmCode, userCode, userHomeCode];
    const [result] = await this.db.execute<ResultSetHeader>(sql, params);
    return result.affectedRows;
  }

  async useOrUnuseTaskMedicineForQr(userCode: string, userHomeCode: string, taskAlarmCode: string, isUse: YnEnum): Promise<number> {
    const sql = `
        UPDATE ${this.tableTaskMedicine} A
        LEFT JOIN ${this.tableTaskAlarm} B
          ON A.seqNextTime = B.seq
        SET isUse = ?, A.updatedId = ?, A.updatedAt = NOW()
        WHERE 
          B.taskAlarmCode = ?
          AND A.userCode = ?
          AND A.userHomeCode = ?`;
    const params = [isUse, userCode, taskAlarmCode, userCode, userHomeCode];
    const [result] = await this.db.execute<ResultSetHeader>(sql, params);
    return result.affectedRows;
  }

  async getTaskMedicineCompleteAndNotUseList(userHomeCode: string): Promise<TaskMedicineQrResDto[]> {
    const currentYear = moment().year(); // lấy năm hiện tại
    const query = `
          SELECT 
            A.taskAlarmCode AS medicineTaskAlarmCode, B.medicineUsage,
            CASE
              WHEN C.keyOption != '${TODO_CONST.TASK_OPTION_MEDICINE.OTHER.value}' THEN C.valueOption
              ELSE B.medicineOther
            END AS medicineName,
            DATE_FORMAT(COALESCE(A.updatedAt, A.createdAt),'%Y-%m-%d %H:%i:%s') AS timestamp
          FROM ${this.tableTaskAlarm} A
          LEFT JOIN ${this.tableTaskMedicine} B
            ON A.seq = B.seqNextTime
          LEFT JOIN ${this.tableOption} C
            ON B.medicineOptionCode = C.code
          LEFT JOIN ${this.tableTask} D
            ON A.taskCode = D.taskCode
          WHERE A.userHomeCode = ? AND A.taskStatus = 'COMPLETE' 
          AND D.taskKeyword = '${TODO_CONST.TASK_EVENT.MEDICINE.value}'  AND YEAR(B.createdAt) = ?
          AND B.isUse = 'N'`;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [userHomeCode, currentYear]);
    return rows as TaskMedicineQrResDto[];
  }

  // TODO: HARVERT
  async getTotalTaskHarvestForAdjust(dto: GetListTaskHarvestForAdjustDto, userCode: string): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(A.seq) AS TOTAL        
        FROM ${this.tableTaskAlarm} A
        INNER JOIN ${this.tableTask} B
          ON A.taskCode = B.taskCode
          AND B.taskKeyword = '${TODO_CONST.TASK_EVENT.HARVEST.value}'
        INNER JOIN ${this.tableTaskHarvestPhase} C
          ON A.seq = C.seqAlarm
          AND C.isDone = 'Y'
        WHERE A.userHomeCode = ?
          AND A.userCode = ?
          AND NOT EXISTS (
            SELECT 1
            FROM ${this.tableQr} D
            WHERE D.seqHarvestPhase = C.seq ) `,
      [dto.userHomeCode, userCode],
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }

  async getListTaskHarvestForAdjust(dto: GetListTaskHarvestForAdjustDto, userCode: string): Promise<GetListTaskHarvestResDto[]> {
    let params: (string | number)[] = [dto.userHomeCode, userCode];
    let offsetQuery = ` `;
    if (dto.limit != 0 && dto.page != 0) {
      offsetQuery += `LIMIT ? OFFSET ?`;
      params.push(dto.limit);
      params.push((dto.page - 1) * dto.limit);
    }
    let query = ` 
        SELECT 
            A.seq, A.taskAlarmCode, A.userHomeCode, C.harvestPhase,  C.harvestYear,
            E.userHomeFloor AS totalFloor,
            CAST(IFNULL(SUM(D.cellCollected), 0) AS SIGNED) AS totalCellCollected,
            CAST(IFNULL(SUM(D.cellRemain), 0) AS SIGNED) AS totalCellRemain
        FROM ${this.tableTaskAlarm} A
        INNER JOIN ${this.tableTask} B
          ON A.taskCode = B.taskCode
          AND B.taskKeyword = '${TODO_CONST.TASK_EVENT.HARVEST.value}'
        INNER JOIN ${this.tableTaskHarvestPhase} C
          ON A.seq = C.seqAlarm
          AND C.isDone = 'Y'
        INNER JOIN ${this.tableUserHome} E
          ON A.userHomeCode = E.userHomeCode
        LEFT JOIN ${this.tableTaskHarvest} D
          ON A.seq = D.seqAlarm
        WHERE A.userHomeCode = ?
          AND A.userCode = ?
          AND NOT EXISTS (
            SELECT 1
            FROM ${this.tableQr} Q 
            WHERE Q.seqHarvestPhase = C.seq
        )
        GROUP BY A.seq, A.taskAlarmCode, C.harvestPhase, C.harvestYear, E.userHomeFloor
        ${offsetQuery}`;
    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as GetListTaskHarvestResDto[];
  }

  async getOneTaskHarvest(taskAlarmCode: string): Promise<(GetTaskAlarmResDto & GetHarvestTaskPhaseResDto) | null> {
    let query = ` SELECT A.seq, A.taskAlarmCode, A.taskCode, B.taskKeyword, A.taskName, A.taskDate, A.taskStatus,
        A.userCode, A.userHomeCode, A.taskNote
        FROM ${this.tableTaskAlarm}  A
        LEFT JOIN ${this.tableTask} B
        ON A.taskCode = B.taskCode 
        WHERE A.taskAlarmCode  = ? AND B.taskKeyword = '${TODO_CONST.TASK_EVENT.HARVEST.value}'
        LIMIT 1 `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskAlarmCode]);
    return rows.length ? (rows[0] as GetTaskAlarmResDto & GetHarvestTaskPhaseResDto) : null;
  }

  async getMaxHarvestPhase(userHomeCode: string): Promise<number> {
    const currentYear = moment().year(); // lấy năm hiện tại
    const query = `
        SELECT MAX(harvestPhase) AS PHASE
        FROM ${this.tableTaskHarvestPhase}
        WHERE userHomeCode = ?
          AND harvestYear = ? AND isDone = 'Y'`;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [userHomeCode, currentYear]);
    return rows.length ? Number(rows[0].PHASE + 1) : 1;
  }

  async insertTaskHarvestPhase(userCode: string, userHomeCode: string, seqAlarm: number, harvestPhase: number, isDone: YnEnum): Promise<number> {
    const currentYear = moment().year(); // lấy năm hiện tại
    const sql = `
      INSERT INTO ${this.tableTaskHarvestPhase}  (seqAlarm, userHomeCode, harvestPhase, isDone, harvestYear, createdId) 
      VALUES(?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seqAlarm, userHomeCode, harvestPhase, isDone, currentYear, userCode]);

    return result.insertId;
  }
  async completeTaskHarvestPhase(userCode: string, userHomeCode: string, seqAlarm: number, harvestPhase: number): Promise<number> {
    const currentYear = moment().year(); // lấy năm hiện tại

    const sql = `
      UPDATE ${this.tableTaskHarvestPhase}
      SET isDone = ?, updatedId = ?, updatedAt = NOW()
      WHERE seqAlarm = ? AND harvestYear = ? AND harvestPhase = ? AND userHomeCode = ?`;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [YnEnum.Y, userCode, seqAlarm, currentYear, harvestPhase, userHomeCode]);
    return result.affectedRows;
  }

  async getTaskHarvestRows(seq: number, isOnlyActive: boolean): Promise<(GetTaskAlarmResDto & HarvestDataRowInputDto)[]> {
    let query = `  
      SELECT A.seq, A.taskAlarmCode, A.taskCode, C.taskKeyword, A.taskName, A.taskDate, A.taskStatus, A.taskNote,
        B.seq, B.seqAlarm, B.userCode, B.userHomeCode, B.floor, B.cell, B.cellCollected, B.cellRemain
        FROM ${this.tableTaskAlarm} A
        LEFT JOIN ${this.tableTaskHarvest} B
        ON A.seq = B.seqAlarm
        LEFT JOIN ${this.tableTask} C
        ON A.taskCode = C.taskCode
        WHERE A.seq  = ?  AND C.taskKeyword = '${TODO_CONST.TASK_EVENT.HARVEST.value}' 
        ${isOnlyActive ? ` AND B.isActive = 'Y' ` : ''} `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [seq]);
    return rows as (GetTaskAlarmResDto & HarvestDataRowInputDto)[];
  }

  async insertTaskHarvestRows(dto: HarvestDataRowInputDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableTaskHarvest}  (seqAlarm, userCode,  userHomeCode, floor, cell, cellCollected, cellRemain, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.seqAlarm, dto.userCode, dto.userHomeCode, dto.floor, dto.cell, dto.cellCollected, dto.cellRemain, dto.userCode]);

    return result.insertId;
  }

  async updateTaskHarvestRows(dto: HarvestDataRowInputDto): Promise<number> {
    const sql = `
        UPDATE ${this.tableTaskHarvest}
        SET cellCollected = ?, cellRemain = ?, updatedId = ?, updatedAt = NOW(), isActive = 'Y'
        WHERE seqAlarm = ? AND  userCode = ? AND userHomeCode = ?
          AND floor = ?
          AND cell = ?`;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.cellCollected, dto.cellRemain, dto.userCode, dto.seqAlarm, dto.userCode, dto.userHomeCode, dto.floor, dto.cell]);

    return result.affectedRows;
  }

  async deleteTaskHarvestRows(seqAlarm: number, floor: number, cell: number, userCode: string, userHomeCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableTaskHarvest}
      SET isActive = 'N', updatedId = ?, updatedAt = NOW()
      WHERE seqAlarm = ? AND  userCode = ? AND userHomeCode = ?
        AND floor = ?
        AND cell = ?
        AND isActive = 'Y'`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, seqAlarm, userCode, userHomeCode, floor, cell]);
    return result.affectedRows;
  }

  async getTaskHarvestCompleteAndNotUseList(userHomeCode: string, harvestPhase: number): Promise<(TaskHarvestQrResDto & { seq: number })[]> {
    const currentYear = moment().year(); // lấy năm hiện tại

    let query = `
      SELECT  A.seq, B.seq AS seqHarvestPhase, A.taskAlarmCode AS harvestTaskAlarmCode, B.harvestPhase, B.harvestYear
        FROM ${this.tableTaskAlarm}  A
        LEFT JOIN ${this.tableTaskHarvestPhase} B
          ON A.seq = B.seqAlarm 
        LEFT JOIN ${this.tableTask} C
          ON A.taskCode = C.taskCode
        WHERE A.userHomeCode  = ?  AND A.taskStatus = 'COMPLETE' AND B.isDone = 'Y' 
        AND C.taskKeyword = '${TODO_CONST.TASK_EVENT.HARVEST.value}'
          AND harvestYear = ? 
          AND NOT EXISTS (
            SELECT 1
            FROM ${this.tableQr} Q
            WHERE Q.seqHarvestPhase = B.seq
          )
        ${harvestPhase != 0 ? ' AND B.harvestPhase  = ? ' : ''}`;
    const [rows] = await this.db.query<RowDataPacket[]>(query, harvestPhase != 0 ? [userHomeCode, currentYear, harvestPhase] : [userHomeCode, currentYear]);
    return rows as (TaskHarvestQrResDto & { seq: number })[];
  }

  async checkTaskHarvestCompleteAndNotUse(seq: number): Promise<boolean> {
    const query = `
        SELECT A.seq
        FROM ${this.tableTaskAlarm} A
        INNER JOIN ${this.tableTask} B
            ON A.taskCode = B.taskCode
            AND B.taskKeyword = '${TODO_CONST.TASK_EVENT.HARVEST.value}'
        INNER JOIN ${this.tableTaskHarvestPhase} C
            ON A.seq = C.seqAlarm
            AND C.isDone = 'Y'
        WHERE A.seq = ?
            AND NOT EXISTS (
              SELECT 1
              FROM ${this.tableQr} Q
              WHERE Q.seqHarvestPhase = C.seq
            )
          LIMIT 1 `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [seq]);
    return rows.length > 0;
  }

  async getTaskHarvestCompleteAndNotUseOne(userHomeCode: string, harvestPhase: number, harvestYear: number): Promise<(TaskHarvestQrResDto & { seq: number }) | null> {
    let query = ` 
      SELECT  A.seq, B.seq AS seqHarvestPhase, A.taskAlarmCode AS harvestTaskAlarmCode, B.harvestPhase, B.harvestYear
        FROM ${this.tableTaskAlarm}  A
        LEFT JOIN ${this.tableTaskHarvestPhase} B
          ON A.seq = B.seqAlarm 
        LEFT JOIN ${this.tableTask} C
          ON A.taskCode = C.taskCode
        WHERE A.userHomeCode  = ?  AND A.taskStatus = 'COMPLETE' AND B.isDone = 'Y' AND C.taskKeyword = '${TODO_CONST.TASK_EVENT.HARVEST.value}'
          AND harvestYear = ? 
          AND NOT EXISTS (
            SELECT 1
            FROM ${this.tableQr} Q
            WHERE Q.seqHarvestPhase = B.seq
          ) AND B.harvestPhase  = ? 
          LIMIT 1`;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [userHomeCode, harvestYear, harvestPhase]);
    return rows.length ? (rows[0] as TaskHarvestQrResDto & { seq: number }) : null;
  }
}

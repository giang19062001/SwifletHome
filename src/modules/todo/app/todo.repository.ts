import { Injectable, Inject, Query } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IHarvestTask, IHarvestTaskPhase, ITodoTask, ITodoTaskAlram, ITodoTaskMedicine, PeriodTypeEnum, TaskStatusEnum, TODO_CONST } from '../todo.interface';
import { SetTaskAlarmDto, HarvestDataRowDto, SetTaskMedicineDto } from './todo.dto';
import { CODES, QUERY_HELPER } from 'src/helpers/const.helper';
import { PagingDto } from 'src/dto/admin.dto';
import { generateCode, handleTimezoneQuery } from 'src/helpers/func.helper';
import moment from 'moment';
import { YnEnum } from 'src/interfaces/admin.interface';
import { TaskHarvestQrResDto, TaskMedicineQrResDto } from 'src/modules/qr/app/qr.response';
import { GetTaskAlarmResDto } from './todo.response';

@Injectable()
export class TodoAppRepository {
  private readonly tableTask = 'tbl_todo_tasks';
  private readonly tableHomeTaskAlarm = 'tbl_todo_home_task_alarm';
  private readonly tableBoxTask = 'tbl_todo_box_tasks';
  private readonly tableUserApp = 'tbl_user_app';
  private readonly tableHomeTaskMedicine = 'tbl_todo_home_task_medicine';
  private readonly tableHomeTaskHarvest = 'tbl_todo_home_task_harvest';
  private readonly tableHomeTaskHarvestPhase = 'tbl_todo_home_task_harvest_phase';
  private readonly tableOption = 'tbl_option_common';
  private readonly tableQrRequest = 'tbl_qr_request';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  // TODO: BOX - TASK
  async getBoxTasks(): Promise<ITodoTask[]> {
    let query = `  SELECT A.seq, A.taskCode, B.taskName, A.sortOrder FROM ${this.tableBoxTask} A
    LEFT JOIN ${this.tableTask} B
    ON A.taskCode = B.taskCode
    WHERE A.isActive = 'Y' `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as ITodoTask[];
  }
  // TODO: TASK
  async getTasks(): Promise<ITodoTask[]> {
    let query = `  SELECT seq, taskCode, taskName FROM ${this.tableTask} WHERE isActive = 'Y' `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, []);
    return rows as ITodoTask[];
  }
  async getDetailTask(taskCode: string): Promise<ITodoTask | null> {
    let query = `  SELECT seq, taskCode, taskName FROM ${this.tableTask} WHERE isActive = 'Y' AND taskCode  = ? LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskCode]);
    return rows.length ? (rows[0] as ITodoTask) : null;
  }
  async getTaskByKeyword(taskKeyword: string): Promise<ITodoTask | null> {
    let query = `  SELECT seq, taskCode, taskName FROM ${this.tableTask} WHERE isActive = 'Y' AND taskKeyword  = ? LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskKeyword]);
    return rows.length ? (rows[0] as ITodoTask) : null;
  }

  // TODO: ALARM
    async updateDateOfTaskAlarm(taskDate: string, taskAlarmCode: string, userCode: string): Promise<number> {
    const sql = `
    UPDATE ${this.tableHomeTaskAlarm}
    SET taskDate = ?, updatedId = ?, updatedAt = NOW()
    WHERE taskAlarmCode = ?
  `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [taskDate, userCode, taskAlarmCode]);

    return result.affectedRows;
  }
  async getOneTaskAlarm(taskAlarmCode: string): Promise<GetTaskAlarmResDto | null> {
    let query = ` SELECT A.seq, A.taskAlarmCode, A.taskCode, B.taskKeyword, A.taskName, A.taskDate, A.taskStatus,
    A.userCode, A.userHomeCode, A.taskNote
    FROM ${this.tableHomeTaskAlarm}  A
    LEFT JOIN ${this.tableTask} B
    ON A.taskCode = B.taskCode  
    WHERE A.taskAlarmCode  = ? 
    LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskAlarmCode]);
    return rows.length ? (rows[0] as GetTaskAlarmResDto) : null;
  }

  async getOneTaskAlarmsNearly(userCode: string, userHomeCode: string, taskCode: string, taskName: string, today: string): Promise<GetTaskAlarmResDto | null> {
    let query = `
        SELECT A.seq, A.userCode, A.userHomeCode, A.taskAlarmCode, A.taskCode, A.taskName,
              DATE_FORMAT(A.taskDate, '%Y-%m-%d') AS taskDate, A.taskStatus, A.taskNote, A.isActive
        FROM ${this.tableHomeTaskAlarm} A
        WHERE A.isActive = 'Y'
          AND A.userCode = ?
          AND A.userHomeCode = ?
          AND A.taskCode = ?
          AND A.taskDate >= ?
          AND A.taskDate <= DATE_ADD(?, INTERVAL ${QUERY_HELPER.MAX_DAY_GET_LIST_ALARM} DAY)
          AND A.taskStatus = '${TaskStatusEnum.WAITING}'
        ORDER BY A.taskDate ASC
        LIMIT 1`;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [
      userCode,
      userHomeCode,
      taskCode,
      // taskName,
      today, // CURDATE()
      today, // o CURDATE()
    ]);

    return rows.length ? (rows[0] as GetTaskAlarmResDto) : null;
  }
  async getTotalTaskAlarm(userCode: string, userHomeCode: string): Promise<number> {
    // let whereQuery = ` AND A.userCode = ? AND A.userHomeCode = ? AND A.taskDate <= CURDATE() + INTERVAL ${QUERY_HELPER.MAX_DAY_GET_LIST_ALARM} DAY`;
    let whereQueryV2 = ` AND A.userCode = ? AND A.userHomeCode = ? AND A.taskCode IS NULL  
    AND A.taskDate <= CURDATE() + INTERVAL ${QUERY_HELPER.MAX_DAY_GET_LIST_ALARM} DAY`;

    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(A.seq) AS TOTAL FROM ${this.tableHomeTaskAlarm} A
      INNER JOIN ${this.tableUserApp} B
      ON A.userCode = B.userCode
      WHERE A.isActive = 'Y' ${whereQueryV2} `,
      [userCode, userHomeCode],
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getListTaskAlarms(userCode: string, userHomeCode: string, dto: PagingDto): Promise<GetTaskAlarmResDto[]> {
    // let whereQuery = ` AND A.userCode = ? AND A.userHomeCode = ? AND A.taskDate <= CURDATE() + INTERVAL ${QUERY_HELPER.MAX_DAY_GET_LIST_ALARM} DAY`;
    let whereQueryV2 = ` AND A.userCode = ? AND A.userHomeCode = ?  AND A.taskCode IS NULL  
    AND A.taskDate <= CURDATE() + INTERVAL ${QUERY_HELPER.MAX_DAY_GET_LIST_ALARM} DAY`;

    let offsetQuery = ` `;

    let params: (string | number)[] = [userCode, userHomeCode];
    if (dto.limit != 0 && dto.page != 0) {
      offsetQuery += `LIMIT ? OFFSET ?`;
      params.push(dto.limit);
      params.push((dto.page - 1) * dto.limit);
    }
    let query = `
            SELECT A.seq, A.userCode, A.userHomeCode, A.taskAlarmCode, A.taskCode, A.taskName,
            DATE_FORMAT(A.taskDate, '%Y-%m-%d') AS taskDate, A.taskNote, A.isActive,  A.taskStatus, 
            CASE
                  WHEN A.taskStatus = '${TODO_CONST.TASK_STATUS.WAITING.value}' THEN '${TODO_CONST.TASK_STATUS.WAITING.text}'
                  WHEN A.taskStatus = '${TODO_CONST.TASK_STATUS.COMPLETE.value}' THEN '${TODO_CONST.TASK_STATUS.COMPLETE.text}'
                  WHEN A.taskStatus = '${TODO_CONST.TASK_STATUS.CANCEL.value}' THEN '${TODO_CONST.TASK_STATUS.CANCEL.text}'
                  ELSE ''
              END AS taskStatusLabel,
            '${TODO_CONST.TASK_EVENT.CANCEL.value}' AS leftEvent,
            '${TODO_CONST.TASK_EVENT.CANCEL.text}' AS leftEventLabel,
            '${TODO_CONST.TASK_EVENT.COMPLETE.value}' AS rightEvent,
            '${TODO_CONST.TASK_EVENT.COMPLETE.text}' AS rightEventLabel
            FROM ${this.tableHomeTaskAlarm} A
            INNER JOIN ${this.tableUserApp} B
            ON A.userCode = B.userCode
            LEFT JOIN ${this.tableTask} C
            ON A.taskCode = C.taskCode
            WHERE A.isActive = 'Y'
              ${whereQueryV2} 
            ORDER BY A.taskDate DESC
              ${offsetQuery}`;
    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as GetTaskAlarmResDto[];
  }
  async getListTaskAlarmsToday(dateStr: string): Promise<(GetTaskAlarmResDto & { deviceToken: string })[]> {
    const query = `
    SELECT 
      A.seq, A.userCode, A.userHomeCode, A.taskAlarmCode, A.taskCode,
      A.taskName, DATE_FORMAT(taskDate, '%Y-%m-%d') AS taskDate, 
      A.taskStatus, A.taskNote, A.isActive, B.deviceToken
    FROM ${this.tableHomeTaskAlarm} A
    INNER JOIN ${this.tableUserApp} B
    ON A.userCode = B.userCode
    WHERE A.isActive = 'Y'
      AND A.taskDate >= ?
      AND A.taskCode IS NULL  
      AND A.taskDate <= DATE_ADD(?, INTERVAL ${QUERY_HELPER.MAX_DAY_SEND_NOTIFY} DAY)
    AND A.taskStatus = '${TaskStatusEnum.WAITING}'
    ORDER BY A.taskDate DESC

  `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [dateStr, dateStr]);
    return rows as (GetTaskAlarmResDto & { deviceToken: string })[];
  }
  async changeTaskAlarmStatus(taskStatus: TaskStatusEnum, userCode: string, taskAlarmCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableHomeTaskAlarm}
      SET taskStatus = ?,  updatedId = ?, updatedAt = ?
      WHERE taskAlarmCode = ?  `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      taskStatus,
      userCode, // updatedId
      new Date(),
      taskAlarmCode,
    ]);

    return result.affectedRows;
  }

  async insertTaskAlarm(userCode: string, dto: ITodoTaskAlram): Promise<number> {
    const sqlLast = ` SELECT taskAlarmCode FROM ${this.tableHomeTaskAlarm} ORDER BY taskAlarmCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let taskAlarmCode = CODES.taskAlarmCode.FRIST_CODE;
    if (rows.length > 0) {
      taskAlarmCode = generateCode(rows[0].taskAlarmCode, CODES.taskAlarmCode.PRE, 6);
    }
    const sql = `
      INSERT INTO ${this.tableHomeTaskAlarm}  (userCode, userHomeCode, taskAlarmCode, taskCode,
       taskName, taskDate, taskStatus, taskNote, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      userCode,
      dto.userHomeCode,
      taskAlarmCode,
      dto.taskCode,
      dto.taskName,
      dto.taskDate,
      dto.taskStatus,
      dto.taskNote,
      userCode,
    ]);

    return result.insertId;
  }
  async checkDuplicateTaskAlarm(userCode: string, dto: ITodoTaskAlram): Promise<GetTaskAlarmResDto | null> {
    const query = `
      SELECT seq, userCode, userHomeCode, taskAlarmCode, taskCode, taskName, taskDate, taskNote, isActive
      FROM ${this.tableHomeTaskAlarm}
      WHERE isActive = 'Y'
        AND taskName = ?
        AND taskDate = ?
        AND userHomeCode = ?
        AND userCode = ?
        AND taskStatus = '${TaskStatusEnum.WAITING}' 
      LIMIT 1
    `;

    const params = [dto.taskName, moment(dto.taskDate).format('YYYY-MM-DD'), dto.userHomeCode, userCode];

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);

    return rows?.length ? (rows[0] as GetTaskAlarmResDto) : null;
  }

  // TODO: MEDICINE
  async getTaskMedicine(taskAlarmCode: string): Promise<(GetTaskAlarmResDto & ITodoTaskMedicine) | null> {
    let query = `  SELECT A.taskAlarmCode, A.taskCode, C.taskKeyword, A.taskName, A.taskDate, A.taskStatus, A.taskNote,
    B.seq, B.seqNextTime, B.userCode, B.userHomeCode, B.medicineOptionCode, B.medicineOther, B.medicineUsage
    FROM ${this.tableHomeTaskAlarm} A
    LEFT JOIN ${this.tableHomeTaskMedicine} B
    ON A.seq = B.seqNextTime
    LEFT JOIN ${this.tableTask} C
    ON A.taskCode = C.taskCode
    WHERE taskAlarmCode  = ?  AND C.taskKeyword = '${TODO_CONST.TASK_EVENT.MEDICINE.value}' 
    AND B.isUse = 'N'
    LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskAlarmCode]);
    return rows.length ? (rows[0] as GetTaskAlarmResDto & ITodoTaskMedicine) : null;
  }

  async insertTaskMedicine(userCode: string, userHomeCode: string, seqNextTime: number, dto: SetTaskMedicineDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableHomeTaskMedicine}  (seqNextTime, userCode, userHomeCode, medicineOptionCode, medicineOther, medicineUsage, createdId, isUse) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seqNextTime, userCode, userHomeCode, dto.medicineOptionCode, dto.medicineOther, dto.medicineUsage, userCode, "N"]);

    return result.insertId;
  }
  async updateTaskMedicine(userCode: string, userHomeCode: string, taskAlarmCode: string, dto: SetTaskMedicineDto): Promise<number> {
    const sql = `
    UPDATE ${this.tableHomeTaskMedicine} A
    LEFT JOIN ${this.tableHomeTaskAlarm} B
      ON A.seqNextTime = B.seq
    SET 
      A.medicineOptionCode = ?, A.medicineOther = ?, medicineUsage = ?, A.updatedId = ?, A.updatedAt = NOW()
    WHERE 
      B.taskAlarmCode = ?
      AND A.userCode = ?
      AND A.userHomeCode = ?
  `;

    const params = [dto.medicineOptionCode, dto.medicineOther, dto.medicineUsage, userCode, taskAlarmCode, userCode, userHomeCode];

    const [result] = await this.db.execute<ResultSetHeader>(sql, params);

    return result.affectedRows;
  }
   async useTaskMedicineForQr(userCode: string, userHomeCode: string, taskAlarmCode: string): Promise<number> {
    const sql = `
    UPDATE ${this.tableHomeTaskMedicine} A
    LEFT JOIN ${this.tableHomeTaskAlarm} B
      ON A.seqNextTime = B.seq
    SET isUse = ?, A.updatedId = ?, A.updatedAt = NOW()
    WHERE 
      B.taskAlarmCode = ?
      AND A.userCode = ?
      AND A.userHomeCode = ?
  `;

    const params = ['Y', userCode, taskAlarmCode,  userCode, userHomeCode];
    const [result] = await this.db.execute<ResultSetHeader>(sql, params);
    return result.affectedRows;
  }

  // TODO: HARVERT

  async getTaskHarvestRows(seq: number, isOnlyActive: boolean): Promise<(GetTaskAlarmResDto & IHarvestTask)[]> {
    let query = `  SELECT A.seq, A.taskAlarmCode, A.taskCode, C.taskKeyword, A.taskName, A.taskDate, A.taskStatus, A.taskNote,
     B.seq, B.seqAlarm, B.userCode, B.userHomeCode, B.floor, B.cell, B.cellCollected, B.cellRemain
    FROM ${this.tableHomeTaskAlarm} A
    LEFT JOIN ${this.tableHomeTaskHarvest} B
    ON A.seq = B.seqAlarm
    LEFT JOIN ${this.tableTask} C
    ON A.taskCode = C.taskCode
    WHERE A.seq  = ?  AND C.taskKeyword = '${TODO_CONST.TASK_EVENT.HARVEST.value}' 
    ${isOnlyActive ? ` AND B.isActive = 'Y' ` : ''} `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [seq]);
    return rows as (GetTaskAlarmResDto & IHarvestTask)[];
  }
  async getOneTaskHarvest(taskAlarmCode: string): Promise<GetTaskAlarmResDto | null> {
    let query = ` SELECT A.seq, A.taskAlarmCode, A.taskCode, B.taskKeyword, A.taskName, A.taskDate, A.taskStatus,
    A.userCode, A.userHomeCode, A.taskNote
    FROM ${this.tableHomeTaskAlarm}  A
    LEFT JOIN ${this.tableTask} B
    ON A.taskCode = B.taskCode 
     WHERE A.taskAlarmCode  = ? AND B.taskKeyword = '${TODO_CONST.TASK_EVENT.HARVEST.value}'
    LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskAlarmCode]);
    return rows.length ? (rows[0] as GetTaskAlarmResDto & IHarvestTaskPhase) : null;
  }
  async getMaxHarvestPhase(userHomeCode: string): Promise<number> {
    const currentYear = moment().year(); // lấy năm hiện tại

    const query = `
    SELECT MAX(harvestPhase) AS PHASE
    FROM ${this.tableHomeTaskHarvestPhase}
    WHERE userHomeCode = ?
      AND harvestYear = ? AND isDone = 'Y'
  `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [userHomeCode, currentYear]);
    return rows.length ? Number(rows[0].PHASE + 1) : 1;
  }
  async insertTaskHarvestPhase(userCode: string, userHomeCode: string, seqAlarm: number, harvestPhase: number, isDone: YnEnum): Promise<number> {
    const currentYear = moment().year(); // lấy năm hiện tại
    const sql = `
      INSERT INTO ${this.tableHomeTaskHarvestPhase}  (seqAlarm, userHomeCode, harvestPhase, isDone, harvestYear, createdId) 
      VALUES(?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seqAlarm, userHomeCode, harvestPhase, isDone, currentYear, userCode]);

    return result.insertId;
  }
  async completeTaskHarvestPhase(userCode: string, userHomeCode: string, seqAlarm: number, harvestPhase: number): Promise<number> {
    const currentYear = moment().year(); // lấy năm hiện tại

    const sql = `
    UPDATE ${this.tableHomeTaskHarvestPhase}
    SET isDone = ?, updatedId = ?, updatedAt = NOW()
    WHERE seqAlarm = ? AND harvestYear = ? AND harvestPhase = ? AND userHomeCode = ?
  `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [YnEnum.Y, userCode, seqAlarm, currentYear, harvestPhase, userHomeCode]);

    return result.affectedRows;
  }

  async insertTaskHarvestRows(dto: HarvestDataRowDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableHomeTaskHarvest}  (seqAlarm, userCode,  userHomeCode, floor, cell, cellCollected, cellRemain, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.seqAlarm, dto.userCode, dto.userHomeCode, dto.floor, dto.cell, dto.cellCollected, dto.cellRemain, dto.userCode]);

    return result.insertId;
  }
  async updateTaskHarvestRows(dto: HarvestDataRowDto): Promise<number> {
    const sql = `
    UPDATE ${this.tableHomeTaskHarvest}
    SET cellCollected = ?, cellRemain = ?, updatedId = ?, updatedAt = NOW(), isActive = 'Y'
    WHERE seqAlarm = ? AND  userCode = ? AND userHomeCode = ?
      AND floor = ?
      AND cell = ?
  `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.cellCollected, dto.cellRemain, dto.userCode, dto.seqAlarm, dto.userCode, dto.userHomeCode, dto.floor, dto.cell]);

    return result.affectedRows;
  }
  async deleteTaskHarvestRows(seqAlarm: number, floor: number, cell: number, userCode: string, userHomeCode: string): Promise<number> {
    const sql = `
    UPDATE ${this.tableHomeTaskHarvest}
    SET isActive = 'N', updatedId = ?, updatedAt = NOW()
    WHERE seqAlarm = ? AND  userCode = ? AND userHomeCode = ?
      AND floor = ?
      AND cell = ?
      AND isActive = 'Y'
  `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, seqAlarm, userCode, userHomeCode, floor, cell]);

    return result.affectedRows;
  }

  // TODO -- QRCODE
  async getTaskMedicineCompleteList(userHomeCode: string): Promise<TaskMedicineQrResDto[]> {
    const currentYear = moment().year(); // lấy năm hiện tại

    const query = `
    SELECT 
      A.taskAlarmCode AS medicineTaskAlarmCode,
      B.medicineUsage,
      CASE
        WHEN C.keyOption != '${TODO_CONST.TASK_OPTION_MEDICINE.OTHER.value}' THEN C.valueOption
        ELSE B.medicineOther
      END AS medicineName,
       DATE_FORMAT(COALESCE(A.updatedAt, A.createdAt),'%Y-%m-%d %H:%i:%s') AS timestamp
    FROM ${this.tableHomeTaskAlarm} A
    LEFT JOIN ${this.tableHomeTaskMedicine} B
      ON A.seq = B.seqNextTime
    LEFT JOIN ${this.tableOption} C
      ON B.medicineOptionCode = C.code
    LEFT JOIN ${this.tableTask} D
      ON A.taskCode = D.taskCode
    WHERE A.userHomeCode = ? AND A.taskStatus = 'COMPLETE' AND D.taskKeyword = '${TODO_CONST.TASK_EVENT.MEDICINE.value}'  AND YEAR(B.createdAt) = ?
    AND B.isUse = 'N'
  `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [userHomeCode, currentYear]);
    return rows as TaskMedicineQrResDto[];
  }

  async getTaskHarvestCompleteList(userHomeCode: string, harvestPhase: number): Promise<(TaskHarvestQrResDto & { seq: number })[]> {
    const currentYear = moment().year(); // lấy năm hiện tại

    let query = ` SELECT  A.seq, A.taskAlarmCode AS harvestTaskAlarmCode, B.harvestPhase, B.harvestYear
    FROM ${this.tableHomeTaskAlarm}  A
    LEFT JOIN ${this.tableHomeTaskHarvestPhase} B
      ON A.seq = B.seqAlarm 
    LEFT JOIN ${this.tableTask} C
      ON A.taskCode = C.taskCode
     WHERE A.userHomeCode  = ?  AND A.taskStatus = 'COMPLETE' AND B.isDone = 'Y' AND C.taskKeyword = '${TODO_CONST.TASK_EVENT.HARVEST.value}'
      AND harvestYear = ? 
      AND NOT EXISTS (
        SELECT 1
        FROM tbl_qr_request Q
        WHERE Q.userHomeCode = A.userHomeCode
          AND Q.harvestYear = B.harvestYear
          AND Q.harvestPhase = B.harvestPhase
      )
     ${harvestPhase != 0 ? " AND B.harvestPhase  = ? " : ""}
    `;

 
    const [rows] = await this.db.query<RowDataPacket[]>(query, harvestPhase != 0 ? [userHomeCode, currentYear, harvestPhase] : [userHomeCode, currentYear]);
    return rows as (TaskHarvestQrResDto & { seq: number })[];
  }
}

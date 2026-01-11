import { Injectable, Inject, Query } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ICompleteHarvestTaskRow, ITodoHomeTaskAlram, ITodoHomeTaskPeriod, ITodoTask, ITodoTaskCompleteMedicine, PeriodTypeEnum, TaskStatusEnum, TODO_CONST } from '../todo.interface';
import { CompleteMedicineTaskDto, SetTaskAlarmDto, SetTaskPeriodDto, HarvestDataRowDto } from './todo.dto';
import { CODES, QUERY_HELPER } from 'src/helpers/const.helper';
import { PagingDto } from 'src/dto/admin.dto';
import { generateCode } from 'src/helpers/func.helper';
import moment from 'moment';

@Injectable()
export class TodoAppRepository {
  private readonly tableTask = 'tbl_todo_tasks';
  private readonly tableHomeTaskAlarm = 'tbl_todo_home_task_alarm';
  private readonly tableHomeTaskPeriod = 'tbl_todo_home_task_period';
  private readonly tableBoxTask = 'tbl_todo_box_tasks';
  private readonly tableUserApp = 'tbl_user_app';
  private readonly tableHomeTaskCompleteMedicine = 'tbl_todo_home_task_complete_medicine';
  private readonly tableHomeTaskCompleteHarvest = 'tbl_todo_home_task_complete_harvest';

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

  // TODO: ALARM
  async getOneTaskAlarm(taskAlarmCode: string): Promise<ITodoHomeTaskAlram | null> {
    let query = ` SELECT A.seq, A.taskAlarmCode, A.taskPeriodCode, A.taskCode, B.taskKeyword, A.taskName, A.taskDate, A.taskStatus,
    A.userCode, A.userHomeCode, A.taskNote
    FROM ${this.tableHomeTaskAlarm}  A
    LEFT JOIN ${this.tableTask} B
    ON A.taskCode = B.taskCode  
    WHERE A.taskAlarmCode  = ? 
    LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskAlarmCode]);
    return rows.length ? (rows[0] as ITodoHomeTaskAlram) : null;
  }

  async getOneTaskAlarmsNearly(userCode: string, userHomeCode: string, taskCode: string, taskName: string, today: string): Promise<ITodoHomeTaskAlram | null> {
    let query = `
        SELECT A.seq, A.userCode, A.userHomeCode, A.taskAlarmCode, A.taskPeriodCode, A.taskCode, A.taskName,
              DATE_FORMAT(A.taskDate, '%Y-%m-%d') AS taskDate, A.taskStatus, A.taskNote, A.isActive
        FROM ${this.tableHomeTaskAlarm} A
        LEFT JOIN ${this.tableHomeTaskPeriod} B
          ON A.taskPeriodCode = B.taskPeriodCode
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

    return rows.length ? (rows[0] as ITodoHomeTaskAlram) : null;
  }
  async getTotalTaskAlarm(userCode: string, userHomeCode: string): Promise<number> {
    let whereQuery = ` AND A.userCode = ? AND A.userHomeCode = ? AND A.taskDate <= CURDATE() + INTERVAL ${QUERY_HELPER.MAX_DAY_GET_LIST_ALARM} DAY`;

    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(A.seq) AS TOTAL FROM ${this.tableHomeTaskAlarm} A
      INNER JOIN ${this.tableUserApp} B
      ON A.userCode = B.userCode
      WHERE A.isActive = 'Y' ${whereQuery} `,
      [userCode, userHomeCode],
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getListTaskAlarms(userCode: string, userHomeCode: string, dto: PagingDto): Promise<ITodoHomeTaskAlram[]> {
    let whereQuery = ` AND A.userCode = ? AND A.userHomeCode = ? AND A.taskDate <= CURDATE() + INTERVAL ${QUERY_HELPER.MAX_DAY_GET_LIST_ALARM} DAY`;
    let offsetQuery = ` `;

    let params: (string | number)[] = [userCode, userHomeCode];
    if (dto.limit != 0 && dto.page != 0) {
      offsetQuery += `LIMIT ? OFFSET ?`;
      params.push(dto.limit);
      params.push((dto.page - 1) * dto.limit);
    }
    let query = `
            SELECT A.seq, A.userCode, A.userHomeCode, A.taskAlarmCode, A.taskPeriodCode, A.taskCode, A.taskName,
            DATE_FORMAT(A.taskDate, '%Y-%m-%d') AS taskDate, A.taskNote, A.isActive,  A.taskStatus, 
            CASE
                  WHEN A.taskStatus = '${TODO_CONST.TASK_STATUS.WAITING.value}' THEN '${TODO_CONST.TASK_STATUS.WAITING.text}'
                  WHEN A.taskStatus = '${TODO_CONST.TASK_STATUS.COMPLETE.value}' THEN '${TODO_CONST.TASK_STATUS.COMPLETE.text}'
                  WHEN A.taskStatus = '${TODO_CONST.TASK_STATUS.CANCEL.value}' THEN '${TODO_CONST.TASK_STATUS.CANCEL.text}'
                  ELSE ''
              END AS taskStatusLabel,
            '${TODO_CONST.TASK_EVENT.CANCEL.value}' AS leftEvent,
            '${TODO_CONST.TASK_EVENT.CANCEL.text}' AS leftEventLabel,
            CASE 
                WHEN C.taskKeyword = '${TODO_CONST.TASK_EVENT.HARVEST.value}' THEN '${TODO_CONST.TASK_EVENT.HARVEST.value}'
                WHEN C.taskKeyword = '${TODO_CONST.TASK_EVENT.MEDICINE.value}' THEN '${TODO_CONST.TASK_EVENT.MEDICINE.value}'
                ELSE '${TODO_CONST.TASK_EVENT.COMPLETE.value}'
            END AS rightEvent,
            CASE 
                WHEN C.taskKeyword = '${TODO_CONST.TASK_EVENT.HARVEST.value}' THEN '${TODO_CONST.TASK_EVENT.HARVEST.text}'
                WHEN C.taskKeyword = '${TODO_CONST.TASK_EVENT.MEDICINE.value}' THEN '${TODO_CONST.TASK_EVENT.MEDICINE.text}'
                ELSE '${TODO_CONST.TASK_EVENT.COMPLETE.text}'
            END AS rightEventLabel
            FROM ${this.tableHomeTaskAlarm} A
            INNER JOIN ${this.tableUserApp} B
            ON A.userCode = B.userCode
            LEFT JOIN ${this.tableTask} C
            ON A.taskCode = C.taskCode
            WHERE A.isActive = 'Y'
              ${whereQuery} 
            ORDER BY A.taskDate DESC
              ${offsetQuery}`;
    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as ITodoHomeTaskAlram[];
  }
  async getListTaskAlarmsToday(dateStr: string): Promise<(ITodoHomeTaskAlram & { deviceToken: string })[]> {
    const query = `
    SELECT 
      A.seq, A.userCode, A.userHomeCode, A.taskAlarmCode, A.taskPeriodCode, A.taskCode,
      A.taskName, DATE_FORMAT(taskDate, '%Y-%m-%d') AS taskDate, 
      A.taskStatus, A.taskNote, A.isActive, B.deviceToken
    FROM ${this.tableHomeTaskAlarm} A
    INNER JOIN ${this.tableUserApp} B
    ON A.userCode = B.userCode
    WHERE A.isActive = 'Y'
     AND A.taskDate >= ?
      AND A.taskDate <= DATE_ADD(?, INTERVAL ${QUERY_HELPER.MAX_DAY_SEND_NOTIFY} DAY)
    AND A.taskStatus = '${TaskStatusEnum.WAITING}'
    ORDER BY A.taskDate DESC

  `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [dateStr, dateStr]);
    return rows as (ITodoHomeTaskAlram & { deviceToken: string })[];
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

  async insertTaskAlarm(userCode: string, dto: SetTaskAlarmDto): Promise<number> {
    const sqlLast = ` SELECT taskAlarmCode FROM ${this.tableHomeTaskAlarm} ORDER BY taskAlarmCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let taskAlarmCode = CODES.taskAlarmCode.FRIST_CODE;
    if (rows.length > 0) {
      taskAlarmCode = generateCode(rows[0].taskAlarmCode, CODES.taskAlarmCode.PRE, 6);
    }
    const sql = `
      INSERT INTO ${this.tableHomeTaskAlarm}  (userCode, userHomeCode, taskAlarmCode, taskPeriodCode, taskCode,
       taskName, taskDate, taskStatus, taskNote, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      userCode,
      dto.userHomeCode,
      taskAlarmCode,
      dto.taskPeriodCode,
      dto.taskCode,
      dto.taskName,
      dto.taskDate,
      dto.taskStatus,
      dto.taskNote,
      userCode,
    ]);

    return result.insertId;
  }
  async checkDuplicateTaskAlarm(userCode: string, dto: SetTaskAlarmDto): Promise<ITodoHomeTaskAlram | null> {
    const query = `
      SELECT seq, userCode, userHomeCode, taskAlarmCode, taskPeriodCode, taskCode, taskName, taskDate, taskNote, isActive
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

    return rows?.length ? (rows[0] as ITodoHomeTaskAlram) : null;
  }
  // TODO: PERIOD
  async checkDuplicateTaskPeriod(userCode: string, dto: SetTaskPeriodDto): Promise<ITodoHomeTaskPeriod | null> {
    const query = `
      SELECT seq, userCode, userHomeCode, taskPeriodCode, taskCode, isCustomTask, taskCustomName, isPeriod, periodType, taskNote, periodValue, specificValue, isActive
      FROM ${this.tableHomeTaskPeriod}
      WHERE isActive = 'Y'
        AND (taskCode = ? OR (? IS NULL AND taskCode IS NULL))
        AND isCustomTask = ? AND taskCustomName = ? 
        AND isPeriod = ? 
        AND (periodType = ? OR (? IS NULL AND periodType IS NULL))
        AND (periodValue = ? OR (? IS NULL AND periodValue IS NULL))
        AND (specificValue = ? OR (? IS NULL AND specificValue IS NULL))
        AND userHomeCode = ? AND userCode = ?
      LIMIT 1
    `;

    // prettier-ignore
    const params = [
      dto.taskCode, dto.taskCode,
      dto.isCustomTask, dto.taskCustomName,
      dto.isPeriod,
      dto.periodType, dto.periodType,
      dto.periodValue, dto.periodValue,
      dto.specificValue ? moment(dto.specificValue).format('YYYY-MM-DD') : null,
      dto.specificValue ? moment(dto.specificValue).format('YYYY-MM-DD') : null,
      dto.userHomeCode, userCode,
    ];

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows?.length ? (rows[0] as ITodoHomeTaskPeriod) : null;
  }

  async getListTaskPeriodType(periodType: PeriodTypeEnum): Promise<ITodoHomeTaskPeriod[]> {
    let query = `
      SELECT seq, userCode, userHomeCode, taskPeriodCode, taskCode, isCustomTask, taskCustomName, isPeriod, periodType, periodValue, specificValue, taskNote, isActive
      FROM ${this.tableHomeTaskPeriod} WHERE isActive = 'Y' AND periodType = ?
      `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [periodType]);
    return rows as ITodoHomeTaskPeriod[];
  }
  async insertTaskPeriod(userCode: string, dto: SetTaskPeriodDto): Promise<{ taskPeriodCode: string; insertId: number }> {
    const sqlLast = ` SELECT taskPeriodCode FROM ${this.tableHomeTaskPeriod} ORDER BY taskPeriodCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let taskPeriodCode = CODES.taskPeriodCode.FRIST_CODE;
    if (rows.length > 0) {
      taskPeriodCode = generateCode(rows[0].taskPeriodCode, CODES.taskPeriodCode.PRE, 6);
    }
    const sql = `
      INSERT INTO ${this.tableHomeTaskPeriod}  (userCode, userHomeCode, taskPeriodCode, taskCode, isCustomTask, taskCustomName, isPeriod, periodType,
      periodValue, specificValue, taskNote, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      userCode,
      dto.userHomeCode,
      taskPeriodCode,
      dto.taskCode,
      dto.isCustomTask,
      dto.taskCustomName,
      dto.isPeriod,
      dto.periodType,
      dto.periodValue,
      dto.specificValue,
      dto.taskNote,
      userCode,
    ]);

    return { taskPeriodCode: taskPeriodCode, insertId: result.insertId };
  }
  // TODO: COMPLETE-MEDICINE
  async getTaskCompleteMedicine(taskAlarmCode: string): Promise<ITodoTaskCompleteMedicine | null> {
    let query = `  SELECT seq, seqNextTime, taskAlarmCode, userCode, userHomeCode, medicineNote FROM ${this.tableHomeTaskCompleteMedicine} 
    WHERE taskAlarmCode  = ? LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskAlarmCode]);
    return rows.length ? (rows[0] as ITodoTaskCompleteMedicine) : null;
  }

  async insertTaskCompleteMedicine(userCode: string, userHomeCode: string, dto: CompleteMedicineTaskDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableHomeTaskCompleteMedicine}  (seqNextTime, taskAlarmCode, userCode, userHomeCode, medicineNote, createdId) 
      VALUES(?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [0, dto.taskAlarmCode, userCode, userHomeCode, dto.medicineNote, userCode]);

    return result.insertId;
  }
  async updateTaskCompleteMedicine(userCode: string, taskAlarmCode: string, seqNextTime: number): Promise<number> {
    const sql = `
      UPDATE ${this.tableHomeTaskCompleteMedicine}  SET seqNextTime = ?, updatedId = ?, updatedAt = NOW()
      WHERE taskAlarmCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seqNextTime, userCode, taskAlarmCode]);

    return result.affectedRows;
  }

  // TODO: COMPLETE-HARVER
  async getTaskCompleteHarvests(taskAlarmCode: string, isOnlyActive: boolean): Promise<ICompleteHarvestTaskRow[]> {
    let query = `  SELECT seq, taskAlarmCode, userCode, userHomeCode, floor, cell, cellData FROM ${this.tableHomeTaskCompleteHarvest} 
    WHERE taskAlarmCode  = ?  ${isOnlyActive ? ` AND isActive = 'Y' `: ''} `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskAlarmCode]);
    return rows as ICompleteHarvestTaskRow[];
  }

  async insertTaskCompleteHarvest(dto: HarvestDataRowDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableHomeTaskCompleteHarvest}  (taskAlarmCode, userCode,  userHomeCode, floor, cell, cellData, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.taskAlarmCode, dto.userCode, dto.userHomeCode, dto.floor, dto.cell, dto.cellData, dto.userCode]);

    return result.insertId;
  }
  async updateTaskCompleteHarvest(dto: HarvestDataRowDto): Promise<number> {
    const sql = `
    UPDATE ${this.tableHomeTaskCompleteHarvest}
    SET cellData = ?, updatedId = ?, updatedAt = NOW(), isActive = 'Y'
    WHERE taskAlarmCode = ? AND  userCode = ? AND userHomeCode = ?
      AND floor = ?
      AND cell = ?
  `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.cellData, dto.userCode, dto.taskAlarmCode, dto.userCode, dto.userHomeCode, dto.floor, dto.cell]);

    return result.affectedRows;
  }
  async deleteTaskCompleteHarvest(dto: HarvestDataRowDto): Promise<number> {
    const sql = `
    UPDATE ${this.tableHomeTaskCompleteHarvest}
    SET isActive = 'N', updatedId = ?, updatedAt = NOW()
    WHERE taskAlarmCode = ? AND  userCode = ? AND userHomeCode = ?
      AND floor = ?
      AND cell = ?
      AND isActive = 'Y'
  `;

    // xóa -> cellData = 0
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.userCode, dto.taskAlarmCode, dto.userCode, dto.userHomeCode, dto.floor, dto.cell]);

    return result.affectedRows;
  }
}

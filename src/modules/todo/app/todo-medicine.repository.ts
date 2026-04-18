import { Inject, Injectable } from '@nestjs/common';
import moment from 'moment';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CODES } from 'src/helpers/const.helper';
import { generateCode } from 'src/helpers/func.helper';
import { YnEnum } from 'src/interfaces/admin.interface';
import { TaskMedicineQrResDto } from 'src/modules/qr/app/qr.response';
import { TaskStatusEnum, TODO_CONST } from '../todo.interface';
import { SetTaskMedicineDto } from './todo.dto';
import { GetTasksMedicineRowResDto } from './todo.response';

@Injectable()
export class TodoMedicineAppRepository {
  private readonly tableTaskAlarm = 'tbl_todo_task_alarm';
  private readonly tableTaskMedicine = 'tbl_todo_task_medicine';
  private readonly tableOption = 'tbl_option_common';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  // ─── MEDICINE ─────────────────────────────────────────────────────────────

  async getTaskMedicine(medicineCode: string): Promise<GetTasksMedicineRowResDto | null> {
    const sql = `
      SELECT seq, medicineCode, userCode, userHomeCode,
             medicineOptionCode, medicineOther, medicineUsage,
             DATE_FORMAT(taskDate, '%Y-%m-%d') AS taskDate, taskStatus, isUse
      FROM ${this.tableTaskMedicine}
      WHERE medicineCode = ? AND isUse = 'N'
      LIMIT 1`;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, [medicineCode]);
    return rows.length ? (rows[0] as GetTasksMedicineRowResDto) : null;
  }

  async insertTaskMedicine(
    userCode: string,
    userHomeCode: string,
    taskDate: Date,
    taskStatus: TaskStatusEnum,
    dto: SetTaskMedicineDto,
  ): Promise<{ insertId: number; medicineCode: string }> {
    // generate medicineCode
    const [last] = await this.db.execute<any[]>(`SELECT medicineCode FROM ${this.tableTaskMedicine} ORDER BY medicineCode DESC LIMIT 1`);
    let medicineCode = CODES.medicineCode.FRIST_CODE;
    if (last.length > 0) {
      medicineCode = generateCode(last[0].medicineCode, CODES.medicineCode.PRE, CODES.medicineCode.LEN);
    }

    const sql = `
      INSERT INTO ${this.tableTaskMedicine}
        (medicineCode, userCode, userHomeCode, medicineOptionCode, medicineOther, medicineUsage, taskDate, taskStatus, isUse, createdId)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, 'N', ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      medicineCode, userCode, userHomeCode,
      dto.medicineOptionCode, dto.medicineOther, dto.medicineUsage,
      taskDate, taskStatus, userCode,
    ]);
    return { insertId: result.insertId, medicineCode };
  }

  async updateTaskMedicine(userCode: string, userHomeCode: string, medicineCode: string, dto: SetTaskMedicineDto): Promise<number> {
    const sql = `
      UPDATE ${this.tableTaskMedicine}
      SET medicineOptionCode = ?, medicineOther = ?, medicineUsage = ?, updatedId = ?, updatedAt = NOW()
      WHERE medicineCode = ? AND userCode = ? AND userHomeCode = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.medicineOptionCode, dto.medicineOther, dto.medicineUsage, userCode,
      medicineCode, userCode, userHomeCode,
    ]);
    return result.affectedRows;
  }

  async changeMedicineStatus(userCode: string, userHomeCode: string, medicineCode: string, taskStatus: TaskStatusEnum): Promise<number> {
    const sql = `
      UPDATE ${this.tableTaskMedicine}
      SET taskStatus = ?, updatedId = ?, updatedAt = NOW()
      WHERE medicineCode = ? AND userCode = ? AND userHomeCode = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [taskStatus, userCode, medicineCode, userCode, userHomeCode]);
    return result.affectedRows;
  }

  async updateMedicineTaskDate(userCode: string, userHomeCode: string, medicineCode: string, taskDate: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableTaskMedicine}
      SET taskDate = ?, updatedId = ?, updatedAt = NOW()
      WHERE medicineCode = ? AND userCode = ? AND userHomeCode = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [taskDate, userCode, medicineCode, userCode, userHomeCode]);
    return result.affectedRows;
  }

  async useOrUnuseTaskMedicineForQr(userCode: string, userHomeCode: string, medicineCode: string, isUse: YnEnum): Promise<number> {
    const sql = `
      UPDATE ${this.tableTaskMedicine}
      SET isUse = ?, updatedId = ?, updatedAt = NOW()
      WHERE medicineCode = ? AND userCode = ? AND userHomeCode = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [isUse, userCode, medicineCode, userCode, userHomeCode]);
    return result.affectedRows;
  }

  /** Lấy lịch lăn thuốc WAITING gần nhất để hiển thị 4 Box */
  async getNextMedicineSchedule(userCode: string, userHomeCode: string, today: string): Promise<{ medicineCode: string; taskDate: string; taskStatus: string } | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT medicineCode, DATE_FORMAT(taskDate, '%Y-%m-%d') AS taskDate, taskStatus
       FROM ${this.tableTaskMedicine}
       WHERE userCode = ? AND userHomeCode = ?
         AND taskStatus = '${TaskStatusEnum.WAITING}'
         AND taskDate >= ?
       ORDER BY taskDate ASC
       LIMIT 1`,
      [userCode, userHomeCode, today],
    );
    return rows.length ? (rows[0] as { medicineCode: string; taskDate: string; taskStatus: string }) : null;
  }

  async getTaskMedicineCompleteAndNotUseList(userHomeCode: string): Promise<TaskMedicineQrResDto[]> {
    const currentYear = moment().year();
    const query = `
      SELECT
        A.medicineCode AS medicineTaskAlarmCode,
        A.medicineUsage,
        CASE
          WHEN C.keyOption != '${TODO_CONST.TASK_OPTION_MEDICINE.OTHER.value}' THEN C.valueOption
          ELSE A.medicineOther
        END AS medicineName,
        DATE_FORMAT(COALESCE(A.updatedAt, A.createdAt),'%Y-%m-%d %H:%i:%s') AS timestamp
      FROM ${this.tableTaskMedicine} A
      LEFT JOIN ${this.tableOption} C ON A.medicineOptionCode = C.code
      WHERE A.userHomeCode = ?
        AND A.taskStatus = '${TaskStatusEnum.COMPLETE}'
        AND YEAR(A.createdAt) = ?
        AND A.isUse = 'N'`;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [userHomeCode, currentYear]);
    return rows as TaskMedicineQrResDto[];
  }
}

import { Inject, Injectable } from '@nestjs/common';
import moment from 'moment';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { YnEnum } from 'src/interfaces/admin.interface';
import { TaskMedicineQrResDto } from 'src/modules/qr/app/qr.response';
import { TODO_CONST } from '../todo.interface';
import { SetTaskMedicineDto } from './todo.dto';
import { GetTaskAlarmResDto, GetTasksMedicineRowResDto } from './todo.response';

@Injectable()
export class TodoMedicineAppRepository {
  private readonly tableTask = 'tbl_todo_tasks';
  private readonly tableTaskAlarm = 'tbl_todo_task_alarm';
  private readonly tableTaskMedicine = 'tbl_todo_task_medicine';
  private readonly tableOption = 'tbl_option_common';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  
  // TODO: MEDICINE
  async getTaskMedicine(taskAlarmCode: string): Promise<(GetTaskAlarmResDto & GetTasksMedicineRowResDto) | null> {
    let query = `  
      SELECT A.taskAlarmCode, A.taskCode, C.taskKeyword, A.taskName, A.taskDate, A.taskStatus, A.taskNote,
        B.seq, B.seqAlarm, B.userCode, B.userHomeCode, B.medicineOptionCode, B.medicineOther, B.medicineUsage
        FROM ${this.tableTaskAlarm} A
        LEFT JOIN ${this.tableTaskMedicine} B
        ON A.seq = B.seqAlarm
        LEFT JOIN ${this.tableTask} C
        ON A.taskCode = C.taskCode
        WHERE taskAlarmCode  = ?  AND C.taskKeyword = '${TODO_CONST.TASK_EVENT.MEDICINE.value}' 
        AND B.isUse = 'N'
        LIMIT 1 `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [taskAlarmCode]);
    return rows.length ? (rows[0] as GetTaskAlarmResDto & GetTasksMedicineRowResDto) : null;
  }

  async insertTaskMedicine(userCode: string, userHomeCode: string, seqAlarm: number, dto: SetTaskMedicineDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableTaskMedicine}  (seqAlarm, userCode, userHomeCode, medicineOptionCode, medicineOther, medicineUsage, createdId, isUse) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seqAlarm, userCode, userHomeCode, dto.medicineOptionCode, dto.medicineOther, dto.medicineUsage, userCode, 'N']);
    return result.insertId;
  }

  async updateTaskMedicine(userCode: string, userHomeCode: string, taskAlarmCode: string, dto: SetTaskMedicineDto): Promise<number> {
    const sql = `
        UPDATE ${this.tableTaskMedicine} A
        LEFT JOIN ${this.tableTaskAlarm} B
          ON A.seqAlarm = B.seq
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
          ON A.seqAlarm = B.seq
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
            ON A.seq = B.seqAlarm
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
}

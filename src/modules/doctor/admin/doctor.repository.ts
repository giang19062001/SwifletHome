import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/common';
import { IDoctor, IDoctorFile } from '../doctor.interface';
import { UpdateDoctorDto } from './doctor.dto';

@Injectable()
export class DoctorAdminRepository {
  private readonly table = 'tbl_doctor';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IDoctor[]> {
    let query = `  SELECT A.seq, A.userCode, A.userName, A.userPhone, A.note, A.noteAnswered, A.statusCode, A.createdAt,
        B.valueCode AS statusValue, B.keyCode as statusKey
        FROM ${this.table} A 
         LEFT JOIN tbl_code_common B
        ON A.statusCode = B.code `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IDoctor[];
  }

  async getDetail(seq: number): Promise<IDoctor | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.note, A.noteAnswered, A.statusCode, A.createdAt,
        B.valueCode AS statusValue, B.keyCode as statusKey
        FROM ${this.table} A 
        LEFT JOIN tbl_code_common B
        ON A.statusCode = B.code
        WHERE A.SEQ = ? AND A.isActive = 'Y'
        LIMIT 1 `,
      [seq],
    );
    return rows ? (rows[0] as IDoctor) : null;
  }
  async update(dto: UpdateDoctorDto, seq: number): Promise<number> {
    const sql = `
          UPDATE ${this.table} SET noteAnswered = ?, statusCode = ?, updatedId = ?, updatedAt = ?
          WHERE seq = ?
        `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.noteAnswered, dto.statusCode, dto.updatedId, new Date(), seq]);

    return result.affectedRows;
  }

  async getFilesNotUse(): Promise<IDoctorFile[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.doctorSeq, A.uniqueId, A.filename, A.mimetype FROM tbl_doctor_file A
      WHERE A.doctorSeq = 0 AND A.uniqueId NOT IN (SELECT uniqueId FROM tbl_doctor)
      `,
    );
    return rows as IDoctorFile[];
  }

  
  async deleteFile(seq: number): Promise<number> {
    const sql = `
      DELETE FROM tbl_doctor_file
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }

  async getFilesBySeq(seq: number): Promise<IDoctorFile[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT B.seq, B.filename,  B.mimetype
        FROM ${this.table} A 
        LEFT JOIN tbl_doctor_file B
        ON A.seq = B.doctorSeq
        WHERE A.seq = ?
      `,
      [seq],
    );
    return rows as IDoctorFile[];
  }
}

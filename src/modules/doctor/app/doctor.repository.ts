import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IDoctor, IDoctorFile } from '../doctor.interface';
import { CreateDoctorDto } from './doctor.dto';

@Injectable()
export class DoctorAppRepository {
  private readonly table = 'tbl_doctor';
  private readonly tableFile = 'tbl_doctor_file';

  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async uploadFile(seq: number, uniqueId: string, userCode: string, filenamePath: string, file: Express.Multer.File | IDoctorFile): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableFile} (filename, originalname, size, mimetype, uniqueId, doctorSeq, userCode, createdId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, uniqueId, seq, userCode, userCode]);

    return result.insertId;
  }
  async getDetail(seq: number): Promise<IDoctor | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.note, A.noteAnswered, A.status, A.uniqueId
          FROM ${this.table} A 
          WHERE A.seq = ? AND A.isActive = 'Y'
          LIMIT 1 `,
      [seq],
    );
    return rows ? (rows[0] as IDoctor) : null;
  }
  async create(userCode: string, dto: CreateDoctorDto, status: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.table}  (userCode, userName, userPhone, note, status, uniqueId, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, dto.userName, dto.userPhone, dto.note, status, dto.uniqueId, userCode]);

    return result.insertId;
  }
  async findFilesByUniqueId(uniqueId: string): Promise<{ seq: number }[]> {
    const sql = `
      SELECT seq FROM  ${this.tableFile} WHERE doctorSeq = 0 AND uniqueId = ?
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);

    return rows as { seq: number }[];
  }
  async updateSeqFiles(doctorSeq: number, seq: number, uniqueId: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE  ${this.tableFile} SET doctorSeq = ? , updatedId = ? , updatedAt = NOW()
      WHERE seq = ? AND uniqueId = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [doctorSeq, updatedId, seq, uniqueId]);

    return result.affectedRows;
  }

  async getFilesNotUse(): Promise<IDoctorFile[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.doctorSeq, A.uniqueId, A.filename, A.mimetype FROM ${this.tableFile} A
      WHERE A.doctorSeq = 0 OR A.uniqueId NOT IN (SELECT uniqueId FROM tbl_doctor)
      `,
    );
    return rows as IDoctorFile[];
  }
  async deleteSeqFile(seq: number, updatedId: string): Promise<number> {
    const sql = `
      UPDATE  ${this.tableFile} SET doctorSeq = 0, updatedId = ? , updatedAt = NOW()
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [updatedId, seq]);

    return result.affectedRows;
  }

  async deleteFile(seq: number): Promise<number> {
    const sql = `
      DELETE FROM ${this.tableFile}
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin';
import { generateCode } from 'src/helpers/func';
import { IDoctor, IDoctorFile } from '../doctor.interface';
import { CreateDoctorDto } from './doctor.dto';

@Injectable()
export class DoctorAppRepository {
  private readonly table = 'tbl_doctor';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async uploadFile(seq: number, uniqueId: string, userCode: string, file: Express.Multer.File | IDoctorFile): Promise<number> {
    const sql = `
      INSERT INTO tbl_doctor_file (filename, originalname, size, mimetype, uniqueId, doctorSeq, userCode, createdId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [file.filename, file.originalname, file.size, file.mimetype, uniqueId, seq, userCode, userCode]);

    return result.insertId;
  }
  async getDetail(seq: number): Promise<IDoctor | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.note, A.noteAnswered, A.statusCode, A.uniqueId
          FROM ${this.table} A 
          WHERE A.seq = ? AND A.isActive = 'Y'
          LIMIT 1 `,
      [seq],
    );
    return rows ? (rows[0] as IDoctor) : null;
  }
  async create(userCode: string, dto: CreateDoctorDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.table}  (userCode, userName, userPhone, note, statusCode, uniqueId, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, dto.userName, dto.userPhone, dto.note, 'COD000008', dto.uniqueId, userCode]);

    return result.insertId;
  }
  async delete(seq: number): Promise<number> {
    const sql = `
      DELETE FROM ${this.table} WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
  async findFilesByUniqueId(uniqueId: string): Promise<{ seq: number }[]> {
    const sql = `
      SELECT seq FROM tbl_doctor_file WHERE doctorSeq = 0 AND uniqueId = ?
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);

    return rows as { seq: number }[];
  }
  async updateSeqFiles(doctorSeq: number, seq: number, uniqueId: string): Promise<number> {
    const sql = `
      UPDATE tbl_doctor_file SET doctorSeq = ? 
      WHERE seq = ? AND uniqueId = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [doctorSeq, seq, uniqueId]);

    return result.affectedRows;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { IDoctor, IDoctorFile } from '../doctor.interface';
import { UpdateDoctorDto } from './doctor.dto';

@Injectable()
export class DoctorAdminRepository {
  private readonly table = 'tbl_doctor';
  private readonly tableFile = 'tbl_doctor_file';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IDoctor[]> {
    let query = `  SELECT A.seq, A.userCode, A.userName, A.userPhone, A.note, A.noteAnswered, A.status, A.createdAt
        FROM ${this.table} A  
        ORDER BY A.createdAt DESC `;

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
      ` SELECT A.seq, A.userCode, A.userName, A.userPhone, A.note, A.noteAnswered, A.status, A.createdAt
        FROM ${this.table} A 
        WHERE A.SEQ = ? AND A.isActive = 'Y'
        LIMIT 1 `,
      [seq],
    );
    return rows ? (rows[0] as IDoctor) : null;
  }
  async update(dto: UpdateDoctorDto, updatedId: string, seq: number): Promise<number> {
    const sql = `
          UPDATE ${this.table} SET noteAnswered = ?, status = ?, updatedId = ?, updatedAt = ?
          WHERE seq = ?
        `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.noteAnswered, dto.status, updatedId, new Date(), seq]);

    return result.affectedRows;
  }

  async getFilesBySeq(seq: number): Promise<IDoctorFile[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT B.seq, B.filename,  B.mimetype
        FROM ${this.table} A 
        LEFT JOIN ${this.tableFile} B
        ON A.seq = B.doctorSeq
        WHERE A.seq = ? AND B.doctorSeq != 0 AND B.isActive = 'Y'
      `,
      [seq],
    );
    return rows as IDoctorFile[];
  }
}

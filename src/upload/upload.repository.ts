import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IFileUpload } from './upload.interface';

@Injectable()
export class UploadRepository {
  private readonly table = 'tbl_uploads';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getAllFile(): Promise<IFileUpload[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.filename, A.originalname, A.size, A.mimetype, A.isActive, A.createdAt, A.createdId
        FROM ${this.table} A `,
    );
    return rows as IFileUpload[];
  }
  async uploadFile(file: Express.Multer.File)  : Promise<number>  {
    const sql = `
      INSERT INTO ${this.table} (filename, originalname, size, mimetype)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      file.filename,
      file.originalname,
      file.size,
      file.mimetype,
    ]);

    return result.insertId;
  }
  async deleteFile(filename: string) : Promise<number> {
    const sql = `
      DELETE FROM ${this.table} WHERE filename = ?
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      filename,
    ]);

    return result.affectedRows;
  }
}

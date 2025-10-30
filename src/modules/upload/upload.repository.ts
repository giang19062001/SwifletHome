import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IFileUpload } from './upload.interface';
import { UploadVideoLinkDto } from './upload.dto';

@Injectable()
export class UploadRepository {
  private readonly table = 'tbl_uploads';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getAllFile(): Promise<IFileUpload[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.filename, A.originalname, A.size, A.mimetype, A.isActive, A.source, A.createdAt, '' as urlLink
        FROM ${this.table} A 
        WHERE isActive = 'Y' `,
    );
    return rows as IFileUpload[];
  }
  async getAllVideoLink(): Promise<IFileUpload[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, '' as filename, '' as originalname, 0 as size, 'video/youtube' as mimetype, A.isActive, 'answer' as source, A.createdAt, A.urlLink
        FROM tbl_uploads_video A 
        WHERE isActive = 'Y' `,
    );
    return rows as IFileUpload[];
  }
  async getFile(filename: string): Promise<IFileUpload | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.filename, A.source
        FROM ${this.table} A 
        WHERE A.filename =? `,
      [filename],
    );
    return rows ? (rows[0] as IFileUpload) : null;
  }
  async uploadFile(source: string, file: Express.Multer.File): Promise<number> {
    const sql = `
      INSERT INTO ${this.table} (filename, originalname, source, size, mimetype)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      file.filename,
      file.originalname,
      source,
      file.size,
      file.mimetype,
    ]);

    return result.insertId;
  }
  async uploadVideoLink(dto: UploadVideoLinkDto): Promise<number> {
    const sql = `
        INSERT INTO tbl_uploads_video (urlLink, createdId) 
        VALUES(?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.urlLink,
      dto.createdId,
    ]);

    return result.insertId;
  }
  async deleteVideoLink(seq: number): Promise<number> {
    const sql = `
      UPDATE tbl_uploads_video SET isActive = 'N' WHERE seq = ?
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
  async deleteFile(filename: string): Promise<number> {
    // const sql = `
    //   DELETE FROM ${this.table} WHERE filename = ?
    // `;

    const sql = `
      UPDATE ${this.table} SET isActive = 'N' WHERE filename = ?
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filename]);

    return result.affectedRows;
  }
}

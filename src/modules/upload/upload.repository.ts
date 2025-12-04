import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IAudioFreePay, IFileUpload } from './upload.interface';
import { UploadAudioFilesDto, UploadVideoLinkDto } from './upload.dto';

@Injectable()
export class UploadRepository {
  private readonly tableImg = 'tbl_uploads_image';
  private readonly tableAudio = 'tbl_uploads_audio';
  private readonly tableVideo = 'tbl_uploads_video';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getAllImgFile(): Promise<IFileUpload[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, '' as filenamePay, A.filename, A.originalname, A.size, A.mimetype, A.isDelete, A.createdAt, '' as urlLink
        FROM ${this.tableImg} A 
        WHERE isDelete = 'Y' `,
    );
    return rows as IFileUpload[];
  }
  async getAllAudioFile(): Promise<IFileUpload[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, B.filename AS filenamePay, A.filename, A.originalname, A.size, A.mimetype, A.isDelete, A.createdAt, '' as urlLink
        FROM ${this.tableAudio} A 
        LEFT JOIN  ${this.tableAudio} B
        ON A.seqPay = B.seq
        WHERE A.isDelete = 'Y' AND A.isFree = 'Y'
         `,
    );
    return rows as IFileUpload[];
  }
  async getAllVideoLink(): Promise<IFileUpload[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, '' as filenamePay, '' as filename, '' as originalname, 0 as size, 'video/youtube' as mimetype, A.isDelete, A.createdAt, A.urlLink
        FROM tbl_uploads_video A 
        WHERE isDelete = 'Y' `,
    );
    return rows as IFileUpload[];
  }
  async getFileImg(filename: string): Promise<IFileUpload | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.filename, A.mimetype
        FROM ${this.tableImg} A 
        WHERE A.filename =? `,
      [filename],
    );
    return rows ? (rows[0] as IFileUpload) : null;
  }
  async getFileAudio(filename: string): Promise<IAudioFreePay | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.filename as filenameFree, A.mimetype as mimetypeFree, B.filename as filenamePay, B.mimetype as mimetypePay
        FROM ${this.tableAudio} A 
         LEFT JOIN  ${this.tableAudio} B
        ON A.seqPay = B.seq
        WHERE A.filename = ? 
         `,
      [filename],
    );
    return rows ? (rows[0] as IAudioFreePay) : null;
  }
  async uploadImg(file: Express.Multer.File, filenamePath: string, createdId: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableImg} (filename, originalname, size, mimetype, createdId)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, createdId]);

    return result.insertId;
  }
  async uploadAudioFree(file: Express.Multer.File, filenamePath: string, createdId: string, seqPay: number): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableAudio} (filename, originalname, size, mimetype, isFree, seqPay, createdId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, 'Y', seqPay, createdId]);

    return result.insertId;
  }

  async uploadAudioPay(file: Express.Multer.File, filenamePath: string, createdId: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableAudio} (filename, originalname, size, mimetype, isFree, createdId)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, 'N', createdId]);

    return result.insertId;
  }
  async uploadVideoLink(dto: UploadVideoLinkDto, createdId: string): Promise<number> {
    const sql = `
        INSERT INTO ${this.tableVideo} (urlLink, createdId) 
        VALUES(?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.urlLink, createdId]);

    return result.insertId;
  }
  async deleteVideoLink(seq: number): Promise<number> {
    const sql = `
      UPDATE  ${this.tableVideo} SET isDelete = 'N' WHERE seq = ?
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
  async deleteAudio(filename: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableAudio} SET isDelete = 'N' WHERE filename = ?
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filename]);

    return result.affectedRows;
  }
  async terminalAudio(filename: string): Promise<number> {
    const sql = `
      DELETE FROM ${this.tableAudio} WHERE filename = ?
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filename]);

    return result.affectedRows;
  }
  async deleteImg(filename: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableImg} SET isDelete = 'N' WHERE filename = ?
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filename]);

    return result.affectedRows;
  }
  async terminalImg(filename: string): Promise<number> {
    const sql = `
      DELETE FROM ${this.tableImg} WHERE filename = ?
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filename]);

    return result.affectedRows;
  }
}

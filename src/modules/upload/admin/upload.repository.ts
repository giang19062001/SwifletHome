import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IAudioFreePay, IFileUpload } from '../upload.interface';
import { UploadAudioFilesDto, UploadMediaVideoLinkDto, UploadVideoLinkDto } from './upload.dto';

@Injectable()
export class UploadAdminRepository {
  private readonly tableImg = 'tbl_uploads_image';
  private readonly tableAudio = 'tbl_uploads_audio';
  private readonly tableVideo = 'tbl_uploads_video';
  private readonly tableMediaAudio = 'tbl_media_audio';
  private readonly tableMediaVideo = 'tbl_media_video';
  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getAllImgFile(): Promise<IFileUpload[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, '' as filenamePay, A.filename, A.originalname, A.size, A.mimetype, A.isActive, A.createdAt, '' as urlLink
        FROM ${this.tableImg} A 
        WHERE isActive = 'Y' `,
    );
    return rows as IFileUpload[];
  }
  //* get audio
  async getAllAudioFile(): Promise<IFileUpload[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, B.filename AS filenamePay, A.filename, A.originalname, A.size, A.mimetype, A.isActive, A.createdAt, '' as urlLink
        FROM ${this.tableAudio} A 
        LEFT JOIN  ${this.tableAudio} B
        ON A.seqPay = B.seq
        WHERE A.isActive = 'Y' AND A.isFree = 'Y'
         `,
    );
    return rows as IFileUpload[];
  }
  // async getAllMediaAudioFile(): Promise<IFileUpload[]> {
  //   const [rows] = await this.db.query<RowDataPacket[]>(
  //     ` SELECT A.seq, B.filename AS filenamePay, A.filename, A.originalname, A.size, A.mimetype, A.isActive, A.createdAt, '' as urlLink
  //       FROM ${this.tableMediaAudio} A 
  //       LEFT JOIN  ${this.tableMediaAudio} B
  //       ON A.seqPay = B.seq
  //       WHERE A.isActive = 'Y' AND A.isFree = 'Y'
  //        `,
  //   );
  //   return rows as IFileUpload[];
  // }
  async getAllMediaAudioFile(): Promise<IFileUpload[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, '' as filenamePay, A.filename, A.originalname, A.size, A.mimetype, A.isActive, A.createdAt, '' as urlLink
        FROM ${this.tableMediaAudio} A 
        WHERE A.isActive = 'Y' 
         `,
    );
    return rows as IFileUpload[];
  }
  //* get video
  async getAllVideoLink(): Promise<IFileUpload[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, '' as filenamePay, '' as filename, '' as originalname, 0 as size, 'video/youtube' as mimetype, A.isActive, A.createdAt, A.urlLink
        FROM ${this.tableVideo} A 
        WHERE isActive = 'Y' `,
    );
    return rows as IFileUpload[];
  }
  async getAllMediaVideoLink(): Promise<IFileUpload[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, '' as filenamePay, '' as filename, A.originalname, 0 as size, 'video/youtube' as mimetype, A.isActive, A.createdAt, A.urlLink
        FROM  ${this.tableMediaVideo} A 
        WHERE isActive = 'Y' `,
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
  //*get audio
  async getFileAudio(seq: number): Promise<IAudioFreePay | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.filename as filenameFree, A.mimetype as mimetypeFree, B.filename as filenamePay, B.mimetype as mimetypePay
        FROM ${this.tableAudio} A 
         LEFT JOIN  ${this.tableAudio} B
        ON A.seqPay = B.seq
        WHERE A.seq = ? 
         `,
      [seq],
    );
    return rows ? (rows[0] as IAudioFreePay) : null;
  }
  async getFileMediaAudio(seq: number): Promise<IAudioFreePay | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.filename as filenameFree, A.mimetype as mimetypeFree, B.filename as filenamePay, B.mimetype as mimetypePay
        FROM ${this.tableMediaAudio} A 
         LEFT JOIN  ${this.tableMediaAudio} B
        ON A.seqPay = B.seq
        WHERE A.seq = ? 
         `,
      [seq],
    );
    return rows ? (rows[0] as IAudioFreePay) : null;
  }
  //* image
  async uploadImg(file: Express.Multer.File, filenamePath: string, createdId: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableImg} (filename, originalname, size, mimetype, createdId)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, createdId]);

    return result.insertId;
  }

  //* audio
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
  async uploadMediaAudioFree(file: Express.Multer.File, filenamePath: string, createdId: string, seqPay: number): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableMediaAudio} (filename, originalname, size, mimetype, isFree, seqPay, createdId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, 'Y', seqPay, createdId]);

    return result.insertId;
  }

  async uploadMediaAudioPay(file: Express.Multer.File, filenamePath: string, createdId: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableMediaAudio} (filename, originalname, size, mimetype, isFree, createdId)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, 'N', createdId]);

    return result.insertId;
  }

  //*video
  async uploadVideoLink(dto: UploadVideoLinkDto, createdId: string): Promise<number> {
    const sql = `
        INSERT INTO ${this.tableVideo} (urlLink, createdId) 
        VALUES(?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.urlLink, createdId]);

    return result.insertId;
  }
  async uploadMediaVideoLink(dto: UploadMediaVideoLinkDto, createdId: string): Promise<number> {
    const sql = `
        INSERT INTO ${this.tableMediaVideo} (originalname, urlLink, createdId) 
        VALUES(?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.originalname, dto.urlLink, createdId]);

    return result.insertId;
  }

  //*delete video
  async deleteVideoLink(seq: number): Promise<number> {
    const sql = `
      UPDATE  ${this.tableVideo} SET isActive = 'N' WHERE seq = ?
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
  async deleteMediaVideoLink(seq: number): Promise<number> {
    const sql = `
      UPDATE  ${this.tableMediaVideo} SET isActive = 'N' WHERE seq = ?
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
  //* delete audio
  async deleteAudio(filename: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableAudio} SET isActive = 'N' WHERE filename = ?
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filename]);

    return result.affectedRows;
  }
  async deleteMediaAudio(filename: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableMediaAudio} SET isActive = 'N' WHERE filename = ?
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
  //* delete image

  async deleteImg(seq: number): Promise<number> {
    const sql = `
      UPDATE ${this.tableImg} SET isActive = 'N' WHERE seq = ?
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

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

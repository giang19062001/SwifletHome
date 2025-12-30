import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IAudioFreePay, IFileMedia, IFileUpload } from '../upload.interface';
import { UploadAudioFilesDto, UploadMediaAudioFilesDto, UploadMediaVideoLinkDto, UploadVideoLinkDto } from './upload.dto';

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
        WHERE isActive = 'Y' 
        ORDER BY A.createdAt DESC`,
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
         ORDER BY A.createdAt DESC
         `,
    );
    return rows as IFileUpload[];
  }
  // async getAllMediaAudioFile(): Promise<IFileMedia[]> {
  //   const [rows] = await this.db.query<RowDataPacket[]>(
  //     ` SELECT A.seq, B.filename AS filenamePay, A.filename, A.originalname, A.size, A.mimetype, A.isActive, A.createdAt, '' as urlLink
  //       FROM ${this.tableMediaAudio} A
  //       LEFT JOIN  ${this.tableMediaAudio} B
  //       ON A.seqPay = B.seq
  //       WHERE A.isActive = 'Y' AND A.isFree = 'Y'
  //        `,
  //   );
  //   return rows as IFileMedia[];
  // }
  async getAllMediaAudioFile(): Promise<IFileMedia[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, '' as filenamePay, A.filename, A.originalname, A.size, A.mimetype, A.isActive, A.createdAt, '' as urlLink, A.isFree, A.isCoupleFree, A.badge
        FROM ${this.tableMediaAudio} A 
        WHERE A.isActive = 'Y' 
       ORDER BY A.createdAt DESC
         `,
    );
    return rows as IFileMedia[];
  }
  //* get video
  async getAllVideoLink(): Promise<IFileUpload[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, '' as filenamePay, '' as filename, '' as originalname, 0 as size, 'video/youtube' as mimetype, A.isActive, A.createdAt, A.urlLink
        FROM ${this.tableVideo} A 
        WHERE isActive = 'Y' 
         ORDER BY A.createdAt DESC `,
    );
    return rows as IFileUpload[];
  }
  async getAllMediaVideoLink(): Promise<IFileMedia[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, '' as filenamePay, '' as filename, A.originalname, 0 as size, 'video/youtube' as mimetype, A.isActive, A.createdAt, A.urlLink, 'Y' as isFree,
       'Y' as isCoupleFree,  A.badge
        FROM  ${this.tableMediaVideo} A 
        WHERE isActive = 'Y' 
         ORDER BY A.createdAt DESC `,
    );
    return rows as IFileMedia[];
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
      ` 
        SELECT 
            A.seq,
            A.filename AS filenameFree,
            B.seq AS seqPay,
            B.filename AS filenamePay
        FROM ${this.tableAudio} A
        LEFT JOIN ${this.tableAudio} B 
            ON (
                (A.isFree = 'N' AND B.seqPay = A.seq) OR
                (A.isFree = 'Y' AND A.seqPay = B.seq)
            )
        WHERE A.seq = ?;
         `,
      [seq],
    );
    return rows ? (rows[0] as IAudioFreePay) : null;
  }
  async getFileMediaAudio(seq: number): Promise<IAudioFreePay | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT 
            A.seq,
            A.filename AS filenameFree,
            B.seq AS seqPay,
            B.filename AS filenamePay
        FROM ${this.tableMediaAudio} A
        LEFT JOIN ${this.tableMediaAudio} B 
            ON (
                (A.isFree = 'N' AND B.seqPay = A.seq) OR
                (A.isFree = 'Y' AND A.seqPay = B.seq)
            )
        WHERE A.seq = ?;

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
  async uploadMediaAudioFree(file: Express.Multer.File, filenamePath: string, createdId: string, dto: UploadMediaAudioFilesDto, seqPay: number): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableMediaAudio} (filename, originalname, size, mimetype, isFree, isCoupleFree, badge, seqPay, createdId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, 'Y', dto.isCoupleFree, dto.badge, seqPay, createdId]);

    return result.insertId;
  }

  async uploadMediaAudioPay(file: Express.Multer.File, filenamePath: string, createdId: string, dto: UploadMediaAudioFilesDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableMediaAudio} (filename, originalname, size, mimetype, isFree, isCoupleFree, badge, createdId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, 'N', dto.isCoupleFree, dto.badge, createdId]);

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
        INSERT INTO ${this.tableMediaVideo} (originalname, urlLink, badge, createdId) 
        VALUES(?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.originalname, dto.urlLink, dto.badge, createdId]);

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

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IAudioFreePay, IFileMedia, IFileUpload } from '../upload.interface';
import { GetAllMediaDto, MediaTypeEnum } from './upload.dto';
import { YnEnum } from 'src/interfaces/admin.interface';

@Injectable()
export class UploadAppRepository {
  private readonly tableImg = 'tbl_uploads_image';
  private readonly tableAudio = 'tbl_uploads_audio';
  private readonly tableVideo = 'tbl_uploads_video';
  private readonly tableMediaAudio = 'tbl_media_audio';
  private readonly tableMediaVideo = 'tbl_media_video';
  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

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
  //* media
  async getTotalMedia(mediaType: MediaTypeEnum, isFree: YnEnum): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(A.seq) AS TOTAL FROM ${mediaType === 'AUDIO' ? this.tableMediaAudio : this.tableMediaVideo} A
      WHERE A.isActive = 'Y' ${mediaType === 'AUDIO' ? ' AND A.isFree = ? ': ''} `,
      mediaType === 'AUDIO' ? [isFree] : [],
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAllMediaAudio(dto: GetAllMediaDto, isFree: YnEnum): Promise<IFileMedia[]> {
    let query = ` SELECT A.seq,  A.filename, A.originalname, A.size, A.mimetype, DATE_FORMAT(A.createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt, '' as urlLink, A.isFree
        FROM ${this.tableMediaAudio} A
        WHERE A.isActive = 'Y' AND isFree = ?
   `;

    let params: any[] = [isFree];

    // paging
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IFileMedia[];
  }

  async getAllMediaVideo(dto: GetAllMediaDto): Promise<IFileMedia[]> {
    let query = ` SELECT A.seq, '' as filename,  A.originalname, 0 as size, 'video/youtube' as mimetype, DATE_FORMAT(A.createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt, A.urlLink, 'Y' as isFree
        FROM ${this.tableMediaVideo} A
        WHERE A.isActive = 'Y'
         `;

    let params: any[] = [];

    // paging
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IFileMedia[];
  }
}

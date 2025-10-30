import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/common';
import { IHome, IHomeImg } from '../home.interface';
import { CreateHomeDto, UpdateHomeDto } from './home.dto';
import { generateCode } from 'src/helpers/func';

@Injectable()
export class HomeAdminRepository {
  private readonly table = 'tbl_home';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`,
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IHome[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.homeCode, A.homeName, A.homeAddress, A.homeDescription, A.latitude, A.longitude, A.homeImage, A.isActive, A.createdAt, A.updatedAt, A.createdId, A.updatedId 
        FROM ${this.table} A  
        ${dto.limit == 0 && dto.page == 0 ? '' : 'LIMIT ? OFFSET ?'} `,
      dto.limit == 0 && dto.page == 0
        ? []
        : [dto.limit, (dto.page - 1) * dto.limit],
    );
    return rows as IHome[];
  }
  async getDetail(homeCode: string): Promise<IHome | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.homeCode, A.homeName, A.homeAddress, A.homeDescription, A.latitude, A.longitude, A.homeImage, A.isActive
          FROM ${this.table} A 
          WHERE A.homeCode = ? `,
      [homeCode],
    );
    return rows ? (rows[0] as IHome) : null;
  }
  async getImages(seq: number): Promise<IHomeImg[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.homeSeq, A.filename, A.originalname, A.source, A.size, A.mimetype, A.isActive
          FROM tbl_home_img A 
          WHERE A.homeSeq = ? `,
      [seq],
    );
    return rows as IHomeImg[];
  }
  async createImages(
    seq: number,
    source: string,
    createdId: string,
    file: Express.Multer.File | IHomeImg,
  ): Promise<number> {
    const sql = `
      INSERT INTO tbl_home_img (filename, originalname, source, size, mimetype, homeSeq, createdId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      file.filename,
      file.originalname,
      source,
      file.size,
      file.mimetype,
      seq,
      createdId,
    ]);

    return result.insertId;
  }

  async createHome(dto: CreateHomeDto): Promise<number> {
    const sqlLast = ` SELECT homeCode FROM ${this.table} ORDER BY homeCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let homeCode = 'HOM000001';
    if (rows.length > 0) {
      homeCode = generateCode(rows[0].homeCode, 'HOM', 6);
    }
    const sql = `
      INSERT INTO ${this.table}  (homeCode, homeName, homeAddress, homeDescription, latitude, longitude, homeImage, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      homeCode,
      dto.homeName,
      dto.homeAddress,
      dto.homeDescription,
      dto.latitude,
      dto.longitude,
      dto.homeImage.filename,
      dto.createdId,
    ]);

    return result.insertId;
  }
  async updateHome(dto: UpdateHomeDto, homeCode: string): Promise<number> {
    const sql = `
        UPDATE ${this.table} SET homeName = ?, homeAddress = ?, homeDescription = ?, latitude = ?, longitude = ?, homeImage = ?
        WHERE homeCode = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.homeName,
      dto.homeAddress,
      dto.homeDescription,
      dto.latitude,
      dto.longitude,
      dto.homeImage.filename,
      homeCode,
    ]);

    return result.affectedRows;
  }

  async deleteHome(homeCode: string): Promise<number> {
    const sql = `
      DELETE FROM ${this.table}
      WHERE homeCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [homeCode]);

    return result.affectedRows;
  }
  async deleteHomeImages(seq: number): Promise<number> {
    const sql = `
      DELETE FROM  tbl_home_img
      WHERE homeSeq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
  async deleteHomeImagesOne(seq: number): Promise<number> {
    const sql = `
      DELETE FROM  tbl_home_img
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
  async deleteHomeImagesMulti(seqList: number[]): Promise<number> {
    const placeholders = seqList.map(() => '?').join(', ');
    const sql = `
    DELETE FROM tbl_home_img
    WHERE seq IN (${placeholders})
  `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, seqList);
    return result.affectedRows;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { IHomeSale, IHomeSaleImg, IHomeSaleSightSeeing } from '../homeSale.interface';
import { CreateHomeDto, UpdateHomeDto, UpdateStatusDto } from './homeSale.dto';
import { generateCode } from 'src/helpers/func.helper';
import { CODES } from 'src/helpers/const.helper';

@Injectable()
export class HomeSaleAdminRepository {
  private readonly table = 'tbl_home_sale';
  private readonly tableImg = 'tbl_home_sale_img';
  private readonly tableSightseeing = 'tbl_home_sale_sightseeing';
  private readonly tableUserApp = 'tbl_user_app';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IHomeSale[]> {
    let query = `   SELECT A.seq, A.homeCode, A.homeName, A.homeAddress, A.homeDescription, A.latitude, A.longitude, A.homeImage, A.isActive, A.createdAt, A.updatedAt, A.createdId, A.updatedId 
        FROM ${this.table} A  
        WHERE A.isActive = 'Y'
        ORDER BY A.createdAt DESC `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IHomeSale[];
  }
  async getDetail(homeCode: string): Promise<IHomeSale | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.homeCode, A.homeName, A.homeAddress, A.homeDescription, A.latitude, A.longitude, A.homeImage, A.isActive
          FROM ${this.table} A 
          WHERE A.homeCode = ? AND A.isActive = 'Y'
          LIMIT 1 `,
      [homeCode],
    );
    return rows ? (rows[0] as IHomeSale) : null;
  }
  async create(dto: CreateHomeDto, homeImagePath: string, createdId: string): Promise<number> {
    const sqlLast = ` SELECT homeCode FROM ${this.table} ORDER BY homeCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let homeCode = CODES.homeCode.FRIST_CODE;
    if (rows.length > 0) {
      homeCode = generateCode(rows[0].homeCode, CODES.homeCode.PRE, CODES.homeCode.LEN);
    }
    const sql = `
      INSERT INTO ${this.table}  (homeCode, homeName, homeAddress, homeDescription, latitude, longitude, homeImage, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [homeCode, dto.homeName, dto.homeAddress, dto.homeDescription, dto.latitude, dto.longitude, homeImagePath, createdId]);

    return result.insertId;
  }
  async update(dto: UpdateHomeDto, homeImagePath: string, updatedId: string, homeCode: string): Promise<number> {
    const sql = `
        UPDATE ${this.table} SET homeName = ?, homeAddress = ?, homeDescription = ?, latitude = ?, longitude = ?, homeImage = ?,
        updatedId = ?, updatedAt = ?
        WHERE homeCode = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.homeName, dto.homeAddress, dto.homeDescription, dto.latitude, dto.longitude, homeImagePath, updatedId, new Date(), homeCode]);

    return result.affectedRows;
  }

  async delete(homeCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET isActive = "N"
      WHERE homeCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [homeCode]);

    return result.affectedRows;
  }
  // IMAGE
  async getImages(seq: number): Promise<IHomeSaleImg[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.homeSeq, A.filename, A.originalname, A.size, A.mimetype, A.isActive
          FROM ${this.tableImg} A 
          WHERE A.homeSeq = ? `,
      [seq],
    );
    return rows as IHomeSaleImg[];
  }
  async createImages(seq: number, createdId: string, filenamePath: string, file: Express.Multer.File | IHomeSaleImg): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableImg} (filename, originalname, size, mimetype, homeSeq, createdId)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, seq, createdId]);

    return result.insertId;
  }

  async deleteHomeImages(seq: number): Promise<number> {
    const sql = `
      DELETE FROM  ${this.tableImg}
      WHERE homeSeq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
  async deleteHomeImagesOne(seq: number): Promise<number> {
    const sql = `
      DELETE FROM  ${this.tableImg}
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
  async deleteHomeImagesMulti(seqList: number[]): Promise<number> {
    const placeholders = seqList.map(() => '?').join(', ');
    const sql = `
    DELETE FROM ${this.tableImg}
    WHERE seq IN (${placeholders})
  `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, seqList);
    return result.affectedRows;
  }
  // TODO: SIGHTSEEING
  async getTotalSightseeing(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(A.seq) AS TOTAL FROM ${this.tableSightseeing} A  
          INNER JOIN ${this.tableUserApp} AU
          ON A.userCode = AU.userCode`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAllSightseeing(dto: PagingDto): Promise<IHomeSaleSightSeeing[]> {
    let query = `  SELECT A.seq, A.homeCode, A.userCode, A.userName, A.userPhone, A.numberAttendCode, A.status, A.note, A.cancelReason, A.createdAt,
          B.homeName, B.homeImage, C.valueOption AS numberAttend
          FROM ${this.tableSightseeing} A 
          INNER JOIN ${this.tableUserApp} AU
          ON A.userCode = AU.userCode
          LEFT JOIN tbl_home_sale B
          ON A.homeCode = B.homeCode
          LEFT JOIN tbl_option_common C
          ON A.numberAttendCode = C.code 
          ORDER BY createdAt DESC`;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IHomeSaleSightSeeing[];
  }

  async getDetailSightseeing(seq: number): Promise<IHomeSaleSightSeeing | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.homeCode, A.userCode, A.userName, A.userPhone, A.numberAttendCode, A.status, A.note, A.cancelReason, A.createdAt,
          B.homeName, B.homeImage, C.valueOption AS numberAttend
          FROM ${this.tableSightseeing} A 
          LEFT JOIN tbl_home_sale B
          ON A.homeCode = B.homeCode
          LEFT JOIN tbl_option_common C
          ON A.numberAttendCode = C.code
          WHERE A.SEQ = ? 
          LIMIT 1 `,
      [seq],
    );
    return rows ? (rows[0] as IHomeSaleSightSeeing) : null;
  }

  async updateSightseeing(dto: UpdateStatusDto, updatedId: string, seq: number): Promise<number> {
    const sql = `
        UPDATE ${this.tableSightseeing} SET status = ?, updatedId = ?, updatedAt = ?
        WHERE seq = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.status, updatedId, new Date(), seq]);

    return result.affectedRows;
  }
}

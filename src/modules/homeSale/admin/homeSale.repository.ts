import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin';
import { IHomeSale, IHomeSaleImg } from '../homeSale.interface';
import { CreateHomeDto, UpdateHomeDto } from './homeSale.dto';
import { generateCode } from 'src/helpers/func';
import { AbAdminRepo } from 'src/abstract/admin.repository';

@Injectable()
export class HomeSaleAdminRepository extends AbAdminRepo {
  private readonly table = 'tbl_home_sale';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {
    super();
  }

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IHomeSale[]> {
    let query = `   SELECT A.seq, A.homeCode, A.homeName, A.homeAddress, A.homeDescription, A.latitude, A.longitude, A.homeImage, A.isActive, A.createdAt, A.updatedAt, A.createdId, A.updatedId 
        FROM ${this.table} A  
        WHERE A.isActive = 'Y' `;

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
  async create(dto: CreateHomeDto): Promise<number> {
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
    const [result] = await this.db.execute<ResultSetHeader>(sql, [homeCode, dto.homeName, dto.homeAddress, dto.homeDescription, dto.latitude, dto.longitude, dto.homeImage.filename, dto.createdId]);

    return result.insertId;
  }
  async update(dto: UpdateHomeDto, homeCode: string): Promise<number> {
    const sql = `
        UPDATE ${this.table} SET homeName = ?, homeAddress = ?, homeDescription = ?, latitude = ?, longitude = ?, homeImage = ?,
        updatedId = ?, updatedAt = ?
        WHERE homeCode = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.homeName,
      dto.homeAddress,
      dto.homeDescription,
      dto.latitude,
      dto.longitude,
      dto.homeImage.filename,
      dto.updatedId,
      new Date(),
      homeCode,
    ]);

    return result.affectedRows;
  }

  async delete(homeCode: string): Promise<number> {
    // const sql = `
    //   DELETE FROM ${this.table}
    //   WHERE homeCode = ?
    // `;
    const sql = `
      UPDATE ${this.table} SET isActive = "N"
      WHERE homeCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [homeCode]);

    return result.affectedRows;
  }
  // images
  async getImages(seq: number): Promise<IHomeSaleImg[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.homeSeq, A.filename, A.originalname, A.size, A.mimetype, A.isActive
          FROM tbl_home_sale_img A 
          WHERE A.homeSeq = ? `,
      [seq],
    );
    return rows as IHomeSaleImg[];
  }
  async createImages(seq: number, createdId: string, file: Express.Multer.File | IHomeSaleImg): Promise<number> {
    const sql = `
      INSERT INTO tbl_home_sale_img (filename, originalname, size, mimetype, homeSeq, createdId)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [file.filename, file.originalname, file.size, file.mimetype, seq, createdId]);

    return result.insertId;
  }

  async deleteHomeImages(seq: number): Promise<number> {
    const sql = `
      DELETE FROM  tbl_home_sale_img
      WHERE homeSeq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
  async deleteHomeImagesOne(seq: number): Promise<number> {
    const sql = `
      DELETE FROM  tbl_home_sale_img
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
  async deleteHomeImagesMulti(seqList: number[]): Promise<number> {
    const placeholders = seqList.map(() => '?').join(', ');
    const sql = `
    DELETE FROM tbl_home_sale_img
    WHERE seq IN (${placeholders})
  `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, seqList);
    return result.affectedRows;
  }
}

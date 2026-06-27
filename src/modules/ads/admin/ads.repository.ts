import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { AdsBannerResDto } from '../ads.response';
import { CreateAdsBannerDto, UpdateAdsBannerDto } from './ads.dto';

@Injectable()
export class AdsAdminRepository {
  private readonly table = 'tbl_ads_banner';
  private readonly tableFile = 'tbl_ads_file';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table} WHERE isActive = 'Y'`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<AdsBannerResDto[]> {
    let query = ` SELECT A.seq, A.title, B.filename as bannerUrl, A.uniqueId, A.position, A.displayOrder, A.startTime, A.endTime, A.targetScreen, A.actionType, A.actionValue, A.isActive, A.createdAt, A.createdId
        FROM ${this.table} A
        LEFT JOIN ${this.tableFile} B ON A.seq = B.adsSeq AND B.isActive = 'Y'
        WHERE A.isActive = 'Y'
        ORDER BY A.displayOrder ASC, A.createdAt DESC  `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as AdsBannerResDto[];
  }
  async getDetail(seq: number): Promise<AdsBannerResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.title, B.filename as bannerUrl, A.uniqueId, A.position, A.displayOrder, A.startTime, A.endTime, A.targetScreen, A.actionType, A.actionValue, A.isActive, A.createdAt, A.createdId
        FROM ${this.table} A
        LEFT JOIN ${this.tableFile} B ON A.seq = B.adsSeq AND B.isActive = 'Y'
        WHERE A.seq = ? AND A.isActive = 'Y'
        LIMIT 1`,
      [seq],
    );
    return rows ? (rows[0] as AdsBannerResDto) : null;
  }
  async create(dto: CreateAdsBannerDto, createdId: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.table} (title, position, displayOrder, startTime, endTime, targetScreen, actionType, actionValue, createdId, uniqueId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.title, dto.position, dto.displayOrder || 0, new Date(dto.startTime), new Date(dto.endTime), dto.targetScreen, dto.actionType || 'LINK', dto.actionValue, createdId, dto.uuid]);

    return result.insertId;
  }
  async update(dto: UpdateAdsBannerDto, updatedId: string, seq: number): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET title = ?, position = ?, displayOrder = ?, startTime = ?, endTime = ?, targetScreen = ?, actionType = ?, actionValue = ?, uniqueId = ?, updatedId = ?, updatedAt = NOW()
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.title, dto.position, dto.displayOrder || 0, new Date(dto.startTime), new Date(dto.endTime), dto.targetScreen, dto.actionType || 'LINK', dto.actionValue, dto.uuid, updatedId, seq]);

    return result.affectedRows;
  }

  async delete(seq: number): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET isActive = 'N', updatedAt = NOW()
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }

  // --- Files Methods ---
  async insertFile(uniqueId: string, filename: string, originalname: string, size: number, mimetype: string, createdId: string): Promise<number> {
    // Ensure 1:1 mapping for banner image by invalidating old file for this uniqueId
    await this.db.execute(`UPDATE ${this.tableFile} SET isActive = 'N', updatedAt = NOW() WHERE uniqueId = ? AND isActive = 'Y'`, [uniqueId]);

    const sql = `
      INSERT INTO ${this.tableFile} (uniqueId, filename, originalname, size, mimetype, createdId)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [uniqueId, filename, originalname, size, mimetype, createdId]);
    return result.insertId;
  }

  async updateSeqFilesByUniqueId(adsSeq: number, uniqueId: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableFile} SET adsSeq = ?, updatedId = ?, updatedAt = NOW()
      WHERE uniqueId = ? AND adsSeq = 0 AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [adsSeq, updatedId, uniqueId]);
    return result.affectedRows;
  }

  async markOldFilesAsInactive(adsSeq: number, uniqueId: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableFile} SET isActive = 'N', updatedId = ?, updatedAt = NOW()
      WHERE adsSeq = ? AND uniqueId != ? AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [updatedId, adsSeq, uniqueId]);
    return result.affectedRows;
  }

  async getFilesNotUse(): Promise<any[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.adsSeq, A.uniqueId, A.filename, A.mimetype FROM ${this.tableFile} A
        WHERE A.adsSeq = 0 OR A.uniqueId NOT IN (SELECT uniqueId FROM ${this.table} WHERE uniqueId IS NOT NULL) OR A.isActive = 'N' `
    );
    return rows;
  }

  async deleteFile(seq: number): Promise<number> {
    const sql = ` DELETE FROM ${this.tableFile} WHERE seq = ? `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);
    return result.affectedRows;
  }
}

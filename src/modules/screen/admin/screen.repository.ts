import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { ScreenResDto } from "../screen.response";
import { UpdateScreenDto } from './screen.dto';

@Injectable()
export class ScreenAdminRepository {
  private readonly table = 'tbl_screen_config';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<ScreenResDto[]> {
    let query = `  SELECT seq, screenKeyword, screenName, screenDescription, contentStart, contentCenter, contentEnd, screenTeamplateKeyword, screenSupportContent, isActive, createdAt, updatedAt, createdId, updatedId 
        FROM ${this.table} WHERE isActive = 'Y' ORDER BY createdAt DESC`;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as ScreenResDto[];
  }
  async getDetail(screenKeyword: string): Promise<ScreenResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `  SELECT A.seq, A.screenKeyword, A.screenName, A.screenDescription, A.contentStart, A.contentCenter, A.contentEnd, A.screenTeamplateKeyword, A.screenSupportContent, A.isActive,
        A.createdAt, A.updatedAt, A.createdId, A.updatedId 
        FROM ${this.table} A
        WHERE A.screenKeyword = ? 
        LIMIT 1`,
      [screenKeyword],
    );
    return rows ? (rows[0] as ScreenResDto) : null;
  }

  async updateBanner(screenKeyword: string, bannerUrl: string, adminId: string): Promise<number> {
    const screen = await this.getDetail(screenKeyword);
    if (!screen) return 0;
    
    let contentCenter = screen.contentCenter;
    if (typeof contentCenter === 'string') {
      try {
        contentCenter = JSON.parse(contentCenter);
      } catch (e) {
        contentCenter = {};
      }
    } else if (!contentCenter) {
      contentCenter = {};
    }
    
    (contentCenter as any).banner = bannerUrl;

    const sql = `UPDATE ${this.table} SET contentCenter = ?, updatedId = ?, updatedAt = NOW() WHERE screenKeyword = ?`;
    const [result] = await this.db.query<ResultSetHeader>(sql, [JSON.stringify(contentCenter), adminId, screenKeyword]);
    return result.affectedRows;
  }

  async update(dto: UpdateScreenDto, updatedId: string, screenKeyword: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET screenName = ?, screenDescription = ?, contentStart = ?, contentCenter = ?, contentEnd = ?, updatedId = ?, updatedAt = ?
      WHERE screenKeyword = ?
    `;
    const contentCenter = dto.contentCenter ? JSON.stringify(dto.contentCenter) : null;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.screenName, dto.screenDescription, dto.contentStart ?? null, contentCenter, dto.contentEnd ?? null, updatedId, new Date(), screenKeyword]);

    return result.affectedRows;
  }

  // --- Dynamic Video Queries ---
  async getAllVideos(tableVideo: string): Promise<any[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT seq, name, address, videoTitle, videoUrl, sortOrder, isActive, createdAt FROM ${tableVideo} WHERE isActive = 'Y' ORDER BY sortOrder ASC, createdAt DESC`
    );
    return rows;
  }

  async createVideo(tableVideo: string, dto: any, createdId: string): Promise<number> {
    const sql = `INSERT INTO ${tableVideo} (name, address, videoTitle, videoUrl, createdId) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.name, dto.address, dto.videoTitle, dto.videoUrl, createdId]);
    return result.insertId;
  }

  async updateVideo(tableVideo: string, seq: number, dto: any, updatedId: string): Promise<number> {
    const sql = `UPDATE ${tableVideo} SET name = ?, address = ?, videoTitle = ?, videoUrl = ?, sortOrder = ?, updatedId = ?, updatedAt = ? WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.name, dto.address, dto.videoTitle, dto.videoUrl, dto.sortOrder ?? 0, updatedId, new Date(), seq]);
    return result.affectedRows;
  }

  async deleteVideo(tableVideo: string, seq: number, updatedId: string): Promise<number> {
    const sql = `UPDATE ${tableVideo} SET isActive = 'N', updatedId = ?, updatedAt = ? WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [updatedId, new Date(), seq]);
    return result.affectedRows;
  }

  async updateVideoSortOrder(tableVideo: string, items: {seq: number; sortOrder: number}[], updatedId: string): Promise<number> {
    let affectedRows = 0;
    for (const item of items) {
      const sql = `UPDATE ${tableVideo} SET sortOrder = ?, updatedId = ?, updatedAt = ? WHERE seq = ?`;
      const [result] = await this.db.execute<ResultSetHeader>(sql, [item.sortOrder, updatedId, new Date(), item.seq]);
      affectedRows += result.affectedRows;
    }
    return affectedRows;
  }
}

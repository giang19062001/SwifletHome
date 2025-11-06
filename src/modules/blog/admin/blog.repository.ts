import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/common';
import { IBlog } from '../blog.interface';
import {
  CreateBlogDto,
  GetAllBlogDto,
  UpdateBlogDto,
} from './blog.dto';
import { generateCode } from 'src/helpers/func';

@Injectable()
export class BlogAdminRepository {
  private readonly table = 'tbl_blog';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(dto: GetAllBlogDto): Promise<number> {
    const params: any[] = [];

    let whereClause = 'WHERE 1 = 1';

    if (dto.blogObject) {
      whereClause += ' AND blogObject = ?';
      params.push(dto.blogObject);
    }

    if (dto.blogCategory) {
      whereClause += ' AND blogCategory = ?';
      params.push(dto.blogCategory);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(seq) AS TOTAL FROM ${this.table} ${whereClause}`,
      params,
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: GetAllBlogDto): Promise<IBlog[]> {
    const params: any[] = [];

    let whereClause = 'WHERE 1 = 1';

    if (dto.blogObject) {
      whereClause += ' AND A.blogObject = ?';
      params.push(dto.blogObject);
    }

    if (dto.blogCategory) {
      whereClause += ' AND A.blogCategory = ?';
      params.push(dto.blogCategory);
    }

    // ALL
    let limitClause = '';
    if (dto.limit > 0 && dto.page > 0) {
      limitClause = 'LIMIT ? OFFSET ?';
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.blogCode, A.blogContent, A.blogObject, A.blogCategory, A.isActive, A.isFree, A.createdAt, A.createdId,
      B.categoryName, C.objectName
      FROM ${this.table} A 
      LEFT JOIN tbl_category B ON A.blogCategory = B.categoryCode
      LEFT JOIN tbl_object C ON A.blogObject = C.objectCharacter
      ${whereClause}
      ${limitClause}`,
      params,
    );
    return rows as IBlog[];
  }
  async getDetail(blogCode: string): Promise<IBlog | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.blogCode, A.blogContent, A.blogObject, A.blogCategory, A.isActive, A.isFree, A.createdAt, A.createdId,
        B.categoryName, C.objectName
        FROM ${this.table} A 
        LEFT JOIN tbl_category B
        ON A.blogCategory = B.categoryCode
        LEFT JOIN tbl_object C
        ON A.blogObject = C.objectCharacter
        WHERE A.blogCode = ? 
        LIMIT 1 `,
      [blogCode],
    );
    return rows ? (rows[0] as IBlog) : null;
  }
  async createBlog(dto: CreateBlogDto): Promise<number> {
    const sqlLast = ` SELECT blogCode FROM ${this.table} ORDER BY blogCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let blogCode = 'BLG000001';
    if (rows.length > 0) {
      blogCode = generateCode(rows[0].blogCode, 'BLG', 6);
    }
    const sql = `
        INSERT INTO ${this.table}  (blogCode, blogContent, blogObject, blogCategory, isFree, createdId) 
        VALUES(?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      blogCode,
      dto.blogContent,
      dto.blogObject,
      dto.blogCategory,
      dto.isFree,
      dto.createdId
    ]);

    return result.insertId;
  }
  async updateBlog(dto: UpdateBlogDto, blogCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET blogContent = ?, blogObject = ?, blogCategory = ?, isFree = ?,
      updatedId = ?, updatedAt = ?
      WHERE blogCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.blogContent,
      dto.blogObject,
      dto.blogCategory,
      dto.isFree,
      dto.updatedId,
      new Date(),
      blogCode,
    ]);

    return result.affectedRows;
  }

  async deleteBlog(blogCode: string): Promise<number> {
    const sql = `
      DELETE FROM ${this.table}
      WHERE blogCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      blogCode,
    ]);

    return result.affectedRows;
  }
}

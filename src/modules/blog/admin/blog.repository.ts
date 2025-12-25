import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { IBlog } from '../blog.interface';
import { CreateBlogDto, GetAllBlogDto, UpdateBlogDto } from './blog.dto';
import { generateCode } from 'src/helpers/func.helper';
import { CODES } from 'src/helpers/const.helper';

@Injectable()
export class BlogAdminRepository {
  private readonly table = 'tbl_blog';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(dto: GetAllBlogDto): Promise<number> {
    const params: any[] = [];

    let whereClause = ` WHERE isActive = 'Y' `;

    if (dto.blogObject) {
      whereClause += ' AND blogObject = ?';
      params.push(dto.blogObject);
    }

    if (dto.blogCategory) {
      whereClause += ' AND blogCategory = ?';
      params.push(dto.blogCategory);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table} ${whereClause}`, params);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: GetAllBlogDto): Promise<IBlog[]> {
    const params: any[] = [];

    let whereClause = ` WHERE  A.isActive = 'Y' `;

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
      ` SELECT A.seq, A.blogCode, A.blogName, A.blogContent, A.blogObject, A.blogCategory, A.isActive, A.isFree, A.createdAt, A.createdId, A.isMain,
      B.categoryName, C.objectName
      FROM ${this.table} A 
      LEFT JOIN tbl_category B ON A.blogCategory = B.categoryCode
      LEFT JOIN tbl_object C ON A.blogObject = C.objectKeyword
      ${whereClause}
      ORDER BY A.createdAt DESC
      ${limitClause}`,
      params,
    );
    return rows as IBlog[];
  }
  async getMainBlog(): Promise<IBlog | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.blogCode, A.blogName, A.blogContent, A.blogObject, A.blogCategory, A.isActive, A.isFree, A.createdAt, A.createdId, A.isMain
            FROM ${this.table} A 
            WHERE A.isActive = 'Y' AND A.isMain = 'Y'
            LIMIT 1 `,
      [],
    );
    return rows ? (rows[0] as IBlog) : null;
  }
  async getDetail(blogCode: string): Promise<IBlog | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.blogCode, A.blogName, A.blogContent, A.blogObject, A.blogCategory, A.isActive, A.isFree, A.createdAt, A.createdId, A.isMain,
        B.categoryName, C.objectName
        FROM ${this.table} A 
        LEFT JOIN tbl_category B
        ON A.blogCategory = B.categoryCode
        LEFT JOIN tbl_object C
        ON A.blogObject = C.objectKeyword
        WHERE A.blogCode = ? AND A.isActive = 'Y'
        LIMIT 1 `,
      [blogCode],
    );
    return rows ? (rows[0] as IBlog) : null;
  }
  async create(dto: CreateBlogDto, isMain: string, createdId: string): Promise<number> {
    const sqlLast = ` SELECT blogCode FROM ${this.table} ORDER BY blogCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let blogCode = CODES.blogCode.FRIST_CODE;
    if (rows.length > 0) {
      blogCode = generateCode(rows[0].blogCode, CODES.blogCode.PRE, CODES.blogCode.LEN);
    }
    const sql = `
        INSERT INTO ${this.table}  (blogCode, blogName, blogContent, blogObject, blogCategory, isFree, isMain, createdId) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [blogCode, dto.blogName, dto.blogContent, dto.blogObject, dto.blogCategory, dto.isFree, isMain, createdId]);

    return result.insertId;
  }
  async update(dto: UpdateBlogDto, updatedId: string, blogCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET blogName = ?, blogContent = ?, blogObject = ?, blogCategory = ?, isFree = ?,
      updatedId = ?, updatedAt = ?
      WHERE blogCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.blogName, dto.blogContent, dto.blogObject, dto.blogCategory, dto.isFree, updatedId, new Date(), blogCode]);

    return result.affectedRows;
  }

  async changeToMain(updatedId: string, blogCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET isMain = 'Y', 
      updatedId = ?, updatedAt = ?
      WHERE blogCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [updatedId, new Date(), blogCode]);

    return result.affectedRows;
  }

  
  async changeToNotMain(updatedId: string, blogCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET isMain = 'N', 
      updatedId = ?, updatedAt = ?
      WHERE blogCode != ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [updatedId, new Date(), blogCode]);

    return result.affectedRows;
  }

  async delete(blogCode: string): Promise<number> {
    const sql = `
      UPDATE  ${this.table}
      SET isActive = 'N'
      WHERE blogCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [blogCode]);

    return result.affectedRows;
  }
}

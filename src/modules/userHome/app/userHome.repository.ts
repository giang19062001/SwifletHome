import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IUserHome, IUserHomeImage } from './userHome.interface';
import { CreateUserHomeDto } from './userHome.dto';
import { generateCode } from 'src/helpers/func.helper';
import { PagingDto } from 'src/dto/admin.dto';
@Injectable()
export class UserHomeAppRepository {
  private readonly table = 'tbl_user_home';
  private readonly tableImg = 'tbl_user_home_img';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getTotal(userCode: string): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table} WHERE userCode = ?`, [userCode]);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto, userCode: string): Promise<IUserHome[]> {
    let query = ` SELECT A.seq, A.userCode, A.userHomeCode, A.userHomeName, A.userHomeAddress, A.userHomeProvince, A.userHomeDescription, A.userHomeImage,
     A.isIntegateTempHum, A.isIntegateCurrent, A.isTriggered, A.isMain
          FROM ${this.table} A 
          WHERE A.userCode = ?`;

    const params: any[] = [];
    params.push(userCode);
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IUserHome[];
  }
  async getDetail(seq: number): Promise<IUserHome | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userHomeCode, A.userHomeName, A.userHomeAddress, A.userHomeProvince, A.userHomeDescription, A.userHomeImage,
       A.isIntegateTempHum, A.isIntegateCurrent,  A.isTriggered, A.isMain
          FROM ${this.table} A 
          WHERE A.seq = ? AND A.isActive = 'Y'
          LIMIT 1 `,
      [seq],
    );
    return rows ? (rows[0] as IUserHome) : null;
  }
  async getMainDetail(seq: number): Promise<IUserHome | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userHomeName, A.userHomeAddress, A.userHomeProvince, A.userHomeDescription, A.userHomeImage,
       A.isIntegateTempHum, A.isIntegateCurrent,  A.isTriggered, A.isMain
          FROM ${this.table} A 
          WHERE A.seq = ? AND A.isActive = 'Y' AND A.isMain = 'Y'
          LIMIT 1 `,
      [seq],
    );
    return rows ? (rows[0] as IUserHome) : null;
  }
  async uploadImageForCreating(seq: number, uniqueId: string, userCode: string, file: Express.Multer.File | IUserHomeImage): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableImg} (filename, originalname, size, mimetype, uniqueId, userHomeSeq, userCode, createdId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [file.filename, file.originalname, file.size, file.mimetype, uniqueId, seq, userCode, userCode]);

    return result.insertId;
  }

  async create(userCode: string, dto: CreateUserHomeDto, userHomeImage: string): Promise<number> {
    const sqlLast = ` SELECT userHomeCode FROM ${this.table} ORDER BY userHomeCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let userHomeCode = 'HOM000001';
    if (rows.length > 0) {
      userHomeCode = generateCode(rows[0].userHomeCode, 'HOM', 6);
    }

    const sql = `
      INSERT INTO ${this.table}  (userCode, userHomeCode, userHomeName, userHomeAddress, userHomeProvince, userHomeDescription, userHomeImage,
       isIntegateTempHum, isIntegateCurrent, isTriggered, isMain, uniqueId, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      userCode,
      userHomeCode,
      dto.userHomeName,
      dto.userHomeAddress,
      dto.userHomeProvince,
      dto.userHomeDescription,
      userHomeImage,
      dto.isIntegateTempHum,
      dto.isIntegateCurrent,
      'N', // isTriggered
      'N', // isMain
      dto.uniqueId,
      userCode,
    ]);

    return result.insertId;
  }
  async findFilesByUniqueId(uniqueId: string): Promise<{ seq: number; filename: string; mimetype: string }[]> {
    const sql = `
      SELECT seq, filename, mimetype FROM ${this.tableImg} WHERE userHomeSeq = 0 AND uniqueId = ?
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);

    return rows as { seq: number; filename: string; mimetype: string }[];
  }
  async updateSeqFiles(userHomeSeq: number, seq: number, uniqueId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableImg} SET userHomeSeq = ? 
      WHERE seq = ? AND uniqueId = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userHomeSeq, seq, uniqueId]);

    return result.affectedRows;
  }
}

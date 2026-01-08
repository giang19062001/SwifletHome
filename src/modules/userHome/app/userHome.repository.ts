import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IUserHome, IUserHomeImageFile } from '../userHome.interface';
import { MutationUserHomeDto } from './userHome.dto';
import { generateCode } from 'src/helpers/func.helper';
import { PagingDto } from 'src/dto/admin.dto';
import { YnEnum } from 'src/interfaces/admin.interface';
import { CODES } from 'src/helpers/const.helper';
@Injectable()
export class UserHomeAppRepository {
  private readonly table = 'tbl_user_home';
  private readonly tableImg = 'tbl_user_home_img';
  private readonly tableUserApp = 'tbl_user_app';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getTotalHomes(userCode: string): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(A.seq) AS TOTAL FROM ${this.table} A  
    INNER JOIN  ${this.tableUserApp} B
    ON A.userCode = B.userCode
    WHERE A.userCode = ?`, [userCode]);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAllHomes(dto: PagingDto, userCode: string): Promise<IUserHome[]> {
    let query = ` SELECT A.seq, A.userCode, A.userHomeCode, A.userHomeName, A.userHomeAddress, B.provinceName AS userHomeProvince, A.userHomeDescription, A.userHomeImage,
     A.isIntegateTempHum, A.isIntegateCurrent, A.isTriggered, A.isMain
    FROM ${this.table} A 
    INNER JOIN  ${this.tableUserApp} B
    ON A.userCode = B.userCode
    LEFT JOIN  tbl_provinces B
    ON A.userHomeProvince = B.provinceCode
    WHERE A.userCode = ? AND A.isActive = 'Y'
    ORDER BY isMain DESC `;

    const params: any[] = [];
    params.push(userCode);
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IUserHome[];
  }
  async getDetailHome(userHomeCode: string): Promise<IUserHome | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userHomeCode, A.userHomeName, A.userHomeAddress, A.userHomeProvince, A.userHomeDescription, A.userHomeImage,
       A.isIntegateTempHum, A.isIntegateCurrent,  A.isTriggered, A.isMain, A.uniqueId
          FROM ${this.table} A 
          INNER JOIN  ${this.tableUserApp} B
          ON A.userCode = B.userCode
          WHERE A.userHomeCode = ? AND A.isActive = 'Y'
          LIMIT 1 `,
      [userHomeCode],
    );
    return rows ? (rows[0] as IUserHome) : null;
  }
  async getMainHomeByUser(userCode: string): Promise<IUserHome | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode,  A.userHomeCode,  A.userHomeName, A.userHomeAddress, A.userHomeProvince, A.userHomeDescription, A.userHomeImage,
       A.isIntegateTempHum, A.isIntegateCurrent,  A.isTriggered, A.isMain, A.uniqueId
          FROM ${this.table} A 
          WHERE A.userCode = ? AND A.isActive = 'Y' AND A.isMain = 'Y'
          LIMIT 1 `,
      [userCode],
    );
    return rows ? (rows[0] as IUserHome) : null;
  }

  async createHome(userCode: string, dto: MutationUserHomeDto, isMain: string, userHomeImage: string): Promise<number> {
    const sqlLast = ` SELECT userHomeCode FROM ${this.table} ORDER BY userHomeCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let userHomeCode = CODES.userHomeCode.FRIST_CODE;
    if (rows.length > 0) {
      userHomeCode = generateCode(rows[0].userHomeCode, CODES.userHomeCode.PRE, 6);
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
      isMain,
      dto.uniqueId,
      userCode,
    ]);

    return result.insertId;
  }

  async updateHomeMain(isMain: YnEnum, userCode: string, userHomeCode: string): Promise<number> {
    const sql = `
    UPDATE ${this.table}
    SET isMain = ?,  updatedId = ?, updatedAt = ?
    WHERE userHomeCode = ?  `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      isMain,
      userCode, // updatedId
      new Date(),
      userHomeCode,
    ]);

    return result.affectedRows;
  }
  async updateHome(userCode: string, userHomeCode: string, dto: MutationUserHomeDto, userHomeImage: string): Promise<number> {
    const sql = `
    UPDATE ${this.table}
    SET 
      userHomeName = ?, userHomeAddress = ?, userHomeProvince = ?, userHomeDescription = ?, 
      userHomeImage = ?, isIntegateTempHum = ?, isIntegateCurrent = ?, uniqueId = ?,  updatedId = ?, updatedAt = ?
      WHERE userHomeCode = ?
  `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.userHomeName,
      dto.userHomeAddress,
      dto.userHomeProvince,
      dto.userHomeDescription,
      userHomeImage,
      dto.isIntegateTempHum,
      dto.isIntegateCurrent,
      dto.uniqueId,
      userCode, // updatedId
      new Date(),
      userHomeCode,
    ]);

    return result.affectedRows;
  }

  async deleteHome(userHomeCode: string, userCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET isActive = ?, updatedId = ? , updatedAt = ?
      WHERE userHomeCode = ? AND userCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, ['N', userCode, new Date(), userHomeCode, userCode]);

    return result.affectedRows;
  }
  // TODO: IMG

  async uploadHomeImage(seq: number, uniqueId: string, userCode: string, filenamePath: string, file: Express.Multer.File | IUserHomeImageFile): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableImg} (filename, originalname, size, mimetype, uniqueId, userHomeSeq, userCode, createdId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, uniqueId, seq, userCode, userCode]);

    return result.insertId;
  }

  async findFilesByUniqueId(uniqueId: string): Promise<{ seq: number; filename: string; mimetype: string } | null> {
    const sql = `
      SELECT seq, filename, mimetype FROM ${this.tableImg} WHERE userHomeSeq = 0 AND uniqueId = ? LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);

    return rows ? (rows[0] as { seq: number; filename: string; mimetype: string }) : null;
  }
  async updateSeqFiles(userHomeSeq: number, seq: number, uniqueId: string , updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableImg} SET userHomeSeq = ? , updatedId = ? , updatedAt = NOW()
      WHERE seq = ? AND uniqueId = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userHomeSeq, updatedId, seq, uniqueId]);

    return result.affectedRows;
  }
  async getFilesNotUse(): Promise<IUserHomeImageFile[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userHomeSeq, A.uniqueId, A.filename, A.mimetype FROM ${this.tableImg} A
        WHERE A.userHomeSeq = 0 OR A.uniqueId NOT IN (SELECT uniqueId FROM ${this.table})
        `,
    );
    return rows as IUserHomeImageFile[];
  }

  async deleteFile(seq: number): Promise<number> {
    const sql = `
        DELETE FROM ${this.tableImg}
        WHERE seq = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
  async deleteFileByUniqueid(uniqueId: string): Promise<number> {
    const sql = `
         DELETE FROM ${this.tableImg}
      WHERE uniqueId = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [uniqueId]);

    return result.affectedRows;
  }
}

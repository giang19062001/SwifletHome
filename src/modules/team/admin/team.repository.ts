import { YnEnum } from './../../../interfaces/admin.interface';
import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { generateCode } from 'src/helpers/func.helper';
import { CODES } from 'src/helpers/const.helper';
import { ITeam, ITeamImg, ITeamReview } from './team.interface';
import { CreateTeamDto, UpdateTeamDto } from './team.dto';

@Injectable()
export class TeamAdminRepository {
  private readonly table = 'tbl_team_user';
  private readonly tableImg = 'tbl_team_img';
  private readonly tableUser = 'tbl_user_app';
  private readonly tableUserType = 'tbl_user_type';
  private readonly tableProvince = 'tbl_provinces';
  private readonly tableReview = 'tbl_team_review';
  private readonly tableReviewImg = 'tbl_team_review_img';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  // TODO: TEAM
  async checkDuplicateTeam(userCode: string, userTypeCode: string): Promise<boolean> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` 
      SELECT seq AS TOTAL FROM ${this.table} 
      WHERE userCode = ? AND userTypeCode = ?
      `,
      [userCode, userTypeCode],
    );
    return rows.length ? true : false;
  }
  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<ITeam[]> {
    let query = ` SELECT A.seq, A.teamCode, A.userCode, A.userTypeCode, A.teamCode, A.teamName, A.teamAddress, A.teamImage, A.teamDescription, A.teamDescriptionSpecial, A.provinceCode,
     A.createdAt, A.updatedAt, A.createdId, A.updatedId , B.userName, C.provinceName, D.userTypeKeyWord, D.userTypeName
        FROM ${this.table} A  
          LEFT JOIN ${this.tableUser} B
          ON A.userCode = B.userCode 
          LEFT JOIN ${this.tableProvince} C
          ON A.provinceCode = C.provinceCode
          LEFT JOIN ${this.tableUserType} D
          ON A.userTypeCode = D.userTypeCode
        WHERE A.isActive = 'Y'
        ORDER BY A.createdAt DESC `;
    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as ITeam[];
  }
  async getDetail(teamCode: string): Promise<ITeam | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userTypeCode, A.teamCode, A.teamName, A.teamAddress, A.teamImage, A.teamDescription, A.teamDescriptionSpecial,
      A.provinceCode, A.isActive
          FROM ${this.table} A 
          WHERE A.teamCode = ? AND A.isActive = 'Y'
          LIMIT 1 `,
      [teamCode],
    );
    return rows ? (rows[0] as ITeam) : null;
  }
  async create(dto: CreateTeamDto, teamImagePath: string, createdId: string): Promise<number> {
    const sqlLast = ` SELECT teamCode FROM ${this.table} ORDER BY teamCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let teamCode = CODES.teamCode.FRIST_CODE;
    if (rows.length > 0) {
      teamCode = generateCode(rows[0].teamCode, CODES.teamCode.PRE, CODES.teamCode.LEN);
    }
    console.log(dto);
    const sql = `
      INSERT INTO ${this.table}  (teamCode, userCode, userTypeCode, teamName, teamAddress, teamImage, teamDescription, teamDescriptionSpecial, provinceCode, createdId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      teamCode,
      dto.userCode,
      dto.userTypeCode,
      dto.teamName,
      dto.teamAddress,
      teamImagePath,
      dto.teamDescription,
      dto.teamDescriptionSpecial,
      dto.provinceCode,
      createdId,
    ]);

    return result.insertId;
  }
  async update(dto: UpdateTeamDto, teamImagePath: string, updatedId: string, teamCode: string): Promise<number> {
    const sql = `
        UPDATE ${this.table} SET teamName = ?, teamAddress = ?, teamDescription = ?, teamDescriptionSpecial = ?, provinceCode = ?, teamImage = ?,
        updatedId = ?, updatedAt = ?
        WHERE teamCode = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.teamName,
      dto.teamAddress,
      dto.teamDescription,
      dto.teamDescriptionSpecial,
      dto.provinceCode,
      teamImagePath,
      updatedId,
      new Date(),
      teamCode,
    ]);

    return result.affectedRows;
  }

  async delete(teamCode: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET isActive = "N"
      WHERE teamCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [teamCode]);

    return result.affectedRows;
  }
  // TODO: IMAGE
  async getImages(seq: number): Promise<ITeamImg[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.teamSeq, A.filename, A.originalname, A.size, A.mimetype, A.isActive
          FROM ${this.tableImg} A 
          WHERE A.teamSeq = ? `,
      [seq],
    );
    return rows as ITeamImg[];
  }
  async createImages(seq: number, createdId: string, filenamePath: string, file: Express.Multer.File | ITeamImg): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableImg} (filename, originalname, size, mimetype, teamSeq, createdId)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, seq, createdId]);

    return result.insertId;
  }

  async deleteHomeImages(seq: number): Promise<number> {
    const sql = `
      DELETE FROM  ${this.tableImg}
      WHERE teamSeq = ?
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
  // TODO: REVIEW
  async getTotalReview(): Promise<number> {
    let query = ` 
      SELECT COUNT(A.seq) AS TOTAL FROM ${this.tableReview} A `;

    const params: any[] = [];
    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAllReview(dto: PagingDto): Promise<ITeamReview[]> {
    let query = ` SELECT A.seq, A.isDisplay, A.teamCode, A.review, A.star, A.reviewBy, B.userName AS reviewByName, 
      C.teamName, D.userName as ownerName, A.createdAt, A.updatedAt,
          COALESCE(
            (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'seq', D.seq,
                  'filename', D.filename,
                  'mimetype', D.mimetype
                )
              )
              FROM ${this.tableReviewImg} D
              WHERE D.reviewSeq = A.seq
            ),
            JSON_ARRAY()
          ) AS reviewImages
          FROM ${this.tableReview} A 
          LEFT JOIN ${this.tableUser} B
            ON A.reviewBy = B.userCode
          LEFT JOIN ${this.table} C
            ON A.teamCode = C.teamCode
          LEFT JOIN ${this.tableUser} D
            ON C.userCode = D.userCode
          WHERE A.isActive = 'Y'
          ORDER BY A.seq DESC
      `;
    const params: any[] = [];

    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as ITeamReview[];
  }
  async getDetailReview(seq: number): Promise<ITeamReview | null> {
    let query = ` SELECT A.seq, A.isDisplay, A.teamCode, A.review, A.star, A.reviewBy, B.userName AS reviewByName, C.teamName, D.userName as ownerName, A.createdAt, A.updatedAt,
          COALESCE(
            (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'seq', D.seq,
                  'filename', D.filename,
                  'mimetype', D.mimetype
                )
              )
              FROM ${this.tableReviewImg} D
              WHERE D.reviewSeq = A.seq
            ),
            JSON_ARRAY()
          ) AS reviewImages
          FROM ${this.tableReview} A 
          LEFT JOIN ${this.tableUser} B
            ON A.reviewBy = B.userCode
          LEFT JOIN ${this.table} C
            ON A.teamCode = C.teamCode
          LEFT JOIN ${this.tableUser} D
            ON C.userCode = D.userCode
          WHERE A.isActive = 'Y' AND A.seq = ?
          LIMIT 1
      `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [seq]);
    return rows.length ? (rows[0] as ITeamReview) : null;
  }
  async changeDisplay(isDisplay: YnEnum, updatedId: string, seq: number): Promise<number> {
    const sql = `
      UPDATE ${this.tableReview} SET isDisplay =  ?, 
      updatedId = ?, updatedAt = ?
      WHERE seq = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [isDisplay, updatedId, new Date(), seq]);

    return result.affectedRows;
  }
}

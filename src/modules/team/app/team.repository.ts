import { Injectable, Inject, Query } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { GetAllTeamDto, GetReviewListOfTeamDto, ReviewTeamDto } from './team.dto';
import { GetAllTeamResDto, GetDetailTeamResDto, GetReviewListOfTeamResDto } from './team.response';
import { ITeamReviewFile } from './team.interface';
@Injectable()
export class TeamAppRepository {
  private readonly table = 'tbl_team_user';
  private readonly tableUser = 'tbl_user_app';
  private readonly tableUserType = 'tbl_user_type';
  private readonly tableTeamImg = 'tbl_team_img';
  private readonly tableReview = 'tbl_team_review';
  private readonly tableReviewImg = 'tbl_team_review_img';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  // TODO: TEAM
  async findTeamByCode(teamCode: string): Promise<Boolean> {
    let query = ` 
        SELECT A.seq FROM ${this.table} A  WHERE A.teamCode = ? `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [teamCode]);
    return rows.length ? true : false;
  }
  async getTotalTeams(dto: GetAllTeamDto, userCode: string): Promise<number> {
    let query = ` 
    SELECT COUNT(A.seq) AS TOTAL FROM ${this.table} A  
    LEFT JOIN ${this.tableUserType} B
    ON A.userTypeCode = B.userTypeCode
    WHERE A.isActive = 'Y' AND A.userCode != ? `;

    const params: any[] = [userCode];
    if (dto.provinceCode) {
      query += ` AND A.provinceCode = ? `;
      params.push(dto.provinceCode);
    }
    if (dto.txtSearch) {
      query += ` AND A.teamName LIKE ?`;
      params.push(`%${dto.txtSearch}%`);
    }
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAllTeams(dto: GetAllTeamDto, userCode: string): Promise<GetAllTeamResDto[]> {
    let query = ` SELECT A.seq, A.userCode, A.userTypeCode, B.userTypeKeyWord, B.userTypeName, A.teamCode, A.teamName, A.teamAddres,
    A.provinceCode, IFNULL(CAST(ROUND(AVG(C.star),1) AS DOUBLE), 0) AS star
    FROM ${this.table} A 
    LEFT JOIN ${this.tableUserType} B
    ON A.userTypeCode = B.userTypeCode
    LEFT JOIN ${this.tableReview} C
    ON A.teamCode = C.teamCode
    WHERE A.isActive = 'Y'  AND A.userCode != ?`;

    const params: any[] = [userCode];
    if (dto.provinceCode) {
      query += ` AND A.provinceCode = ? `;
      params.push(dto.provinceCode);
    }
    if (dto.txtSearch) {
      query += ` AND A.teamName LIKE ?`;
      params.push(`%${dto.txtSearch}%`);
    }

    query += ` GROUP BY  A.seq, A.userCode, A.userTypeCode, B.userTypeKeyWord, B.userTypeName, A.teamCode, A.teamName, A.teamAddres, A.provinceCode `;

    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as GetAllTeamResDto[];
  }

  async getDetailTeam(teamCode: string): Promise<GetDetailTeamResDto | null> {
    let query = ` SELECT A.seq, A.userCode, A.userTypeCode, B.userTypeKeyWord, B.userTypeName, 
            A.teamCode, A.teamName, A.teamAddres,A.provinceCode,
            IFNULL(R.star, 0) AS star, A.teamDescription, A.teamDescriptionSpecial,
            COALESCE(
              (
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'seq', D.seq,
                    'filename', D.filename,
                    'mimetype', D.mimetype
                  )
                )
                FROM ${this.tableTeamImg} D
                WHERE D.teamSeq = A.seq
              ),
              JSON_ARRAY()
            ) AS teamImages

          FROM ${this.table} A 
          LEFT JOIN ${this.tableUserType} B
            ON A.userTypeCode = B.userTypeCode
          LEFT JOIN (
              SELECT 
                teamCode,
                CAST(ROUND(AVG(star),1) AS DOUBLE) AS star
              FROM ${this.tableReview}
              GROUP BY teamCode
          ) R ON A.teamCode = R.teamCode
          WHERE A.isActive = 'Y'
          AND A.teamCode = ?
          LIMIT 1
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [teamCode]);
    let result = rows ? (rows[0] as GetDetailTeamResDto) : null;
    if (result) {
      result.teamImages = typeof result.teamImages === 'string' ? JSON.parse(result.teamImages) : result.teamImages;
    }
    return result;
  }

  // TODO: REVIEW
  async getReviewTotalOfTeam(dto: GetReviewListOfTeamDto): Promise<number> {
    let query = ` 
    SELECT COUNT(A.seq) AS TOTAL FROM ${this.tableReview} A  
    WHERE A.isActive = 'Y' AND A.teamCode = ?`;

    const params: any[] = [dto.teamCode];
    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getReviewListOfTeam(dto: GetReviewListOfTeamDto): Promise<GetReviewListOfTeamResDto[]> {
    let query = ` SELECT A.seq, A.review, A.star, A.reviewBy, B.userName AS reviewByName,
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
        WHERE A.isActive = 'Y' AND A.teamCode = ?
        ORDER BY A.seq DESC
    `;
    const params: any[] = [dto.teamCode];

    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as GetReviewListOfTeamResDto[];
  }

  async insertReview(userCode: string, dto: ReviewTeamDto): Promise<number> {
    const sql = `
        INSERT INTO ${this.tableReview}  (teamCode, review, star, reviewBy, uniqueId, createdId) 
        VALUES(?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.teamCode, dto.review, dto.star, userCode, dto.uniqueId, userCode]);

    return result.insertId;
  }
  async uploadFile(seq: number, uniqueId: string, teamCode: string, userCode: string, filenamePath: string, file: Express.Multer.File | ITeamReviewFile): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableReviewImg} (filename, originalname, size, mimetype, uniqueId, reviewSeq, teamCode, createdId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, uniqueId, seq, teamCode, userCode]);

    return result.insertId;
  }
  async findFilesByUniqueId(uniqueId: string, teamCode: string): Promise<{ seq: number }[]> {
    const sql = `
      SELECT seq FROM  ${this.tableReviewImg} WHERE reviewSeq = 0 AND isActive = 'Y' AND uniqueId = ? AND teamCode = ?
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId, teamCode]);

    return rows as { seq: number }[];
  }
  async updateSeqFiles(reviewSeq: number, seq: number, uniqueId: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE  ${this.tableReviewImg} SET reviewSeq = ? , updatedId = ? , updatedAt = NOW()
      WHERE seq = ? AND uniqueId = ? AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [reviewSeq, updatedId, seq, uniqueId]);

    return result.affectedRows;
  }

  async getFilesNotUse(): Promise<ITeamReviewFile[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.reviewSeq, A.uniqueId, A.filename, A.mimetype FROM ${this.tableReviewImg} A
        WHERE A.reviewSeq = 0 OR A.uniqueId NOT IN (SELECT uniqueId FROM ${this.tableReview} ) OR A.isActive = 'N'
        `,
    );
    return rows as ITeamReviewFile[];
  }

  async deleteFile(seq: number): Promise<number> {
    const sql = `
        DELETE FROM ${this.tableReviewImg}
        WHERE seq = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
}

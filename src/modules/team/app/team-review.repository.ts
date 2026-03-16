import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { GetReviewListOfTeamDto, ReviewTeamDto } from './team.dto';
import { GetReviewListOfTeamResDto } from './team.response';
import { TeamReviewFileResDto } from '../admin/team.dto';

@Injectable()
export class TeamReviewAppRepository {
  private readonly tableUser = 'tbl_user_app';
  private readonly tableReview = 'tbl_team_review';
  private readonly tableReviewImg = 'tbl_team_review_img';
  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  // TODO: REVIEW
  async getReviewTotalOfTeam(dto: GetReviewListOfTeamDto): Promise<number> {
    let query = ` 
    SELECT COUNT(A.seq) AS TOTAL FROM ${this.tableReview} A  
    WHERE A.isActive = 'Y' AND A.isDisplay = 'Y' AND A.teamCode = ?`;

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
        WHERE A.isActive = 'Y' AND A.isDisplay = 'Y' AND A.teamCode = ?
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

  async checkDuplicateReview(teamCode: string, userCode: string): Promise<Boolean> {
    let query = ` 
        SELECT A.seq FROM ${this.tableReview} A  WHERE A.teamCode = ? AND A.reviewBy = ? `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [teamCode, userCode]);
    return rows.length ? true : false;
  }
  async insertReview(userCode: string, dto: ReviewTeamDto): Promise<number> {
    const sql = `
        INSERT INTO ${this.tableReview}  (teamCode, review, star, reviewBy, uniqueId, createdId) 
        VALUES(?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [dto.teamCode, dto.review, dto.star, userCode, dto.uniqueId, userCode]);

    return result.insertId;
  }

  // TODO: REVIEW FILE
  async uploadFile(seq: number, uniqueId: string, teamCode: string, userCode: string, filenamePath: string, file: Express.Multer.File | TeamReviewFileResDto): Promise<number> {
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

  async getFilesNotUse(): Promise<TeamReviewFileResDto[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.reviewSeq, A.uniqueId, A.filename, A.mimetype FROM ${this.tableReviewImg} A
        WHERE A.reviewSeq = 0 OR A.uniqueId NOT IN (SELECT uniqueId FROM ${this.tableReview} ) OR A.isActive = 'N'
        `,
    );
    return rows as TeamReviewFileResDto[];
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

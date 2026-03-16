import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { GetAllTeamDto } from './team.dto';
import { GetAllTeamResDto, GetDetailTeamResDto } from './team.response';

@Injectable()
export class TeamUserAppRepository {
  private readonly table = 'tbl_team_user';
  private readonly tableUserType = 'tbl_user_type';
  private readonly tableTeamImg = 'tbl_team_img';
  private readonly tableReview = 'tbl_team_review';

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
    WHERE A.isActive = 'Y' AND A.userCode != ? AND B.userTypeKeyWord = ? `;

    const params: any[] = [userCode, dto.userTypeKeyWord];
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
    let query = ` SELECT A.seq, A.userCode, A.userTypeCode, B.userTypeKeyWord, B.userTypeName, A.teamCode, A.teamName, A.teamAddress,
    A.provinceCode, IFNULL(CAST(ROUND(AVG(C.star),1) AS DOUBLE), 0) AS star, A.teamImage
    FROM ${this.table} A 
    LEFT JOIN ${this.tableUserType} B
    ON A.userTypeCode = B.userTypeCode
    LEFT JOIN ${this.tableReview} C
    ON A.teamCode = C.teamCode AND C.isDisplay = 'Y'
    WHERE A.isActive = 'Y'  AND A.userCode != ? AND B.userTypeKeyWord = ? `;

    const params: any[] = [userCode, dto.userTypeKeyWord];
    if (dto.provinceCode) {
      query += ` AND A.provinceCode = ? `;
      params.push(dto.provinceCode);
    }
    if (dto.txtSearch) {
      query += ` AND A.teamName LIKE ?`;
      params.push(`%${dto.txtSearch}%`);
    }

    query += ` GROUP BY  A.seq, A.userCode, A.userTypeCode, B.userTypeKeyWord, B.userTypeName, A.teamCode, A.teamName, A.teamAddress, A.provinceCode `;

    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as GetAllTeamResDto[];
  }

  async getDetailTeam(teamCode: string): Promise<GetDetailTeamResDto | null> {
    let query = ` SELECT A.seq, A.userCode, A.userTypeCode, B.userTypeKeyWord, B.userTypeName, 
            A.teamCode, A.teamName, A.teamAddress,A.provinceCode,
            IFNULL(R.star, 0) AS star, A.teamDescription, A.teamDescriptionSpecial,
             A.teamImage,
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
                WHERE D.teamSeq = A.seq AND D.filename <> A.teamImage
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
              WHERE isActive = 'Y' AND isDisplay = 'Y'
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
}

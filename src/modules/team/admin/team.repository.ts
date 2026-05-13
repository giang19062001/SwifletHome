import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { CODES } from 'src/helpers/const.helper';
import { generateCode } from 'src/helpers/func.helper';
import { YnEnum } from './../../../interfaces/admin.interface';
import { CreateTeamDto, TeamImgResDto, TeamResDto, TeamReviewResDto, UpdateTeamDto } from './team.dto';

@Injectable()
export class TeamAdminRepository {
  private readonly table = 'tbl_team_user';
  private readonly tableImg = 'tbl_team_img';
  private readonly tableFileType = 'tbl_team_file_type';
  private readonly tableUser = 'tbl_user_app';
  private readonly tableUserType = 'tbl_user_type';
  private readonly tableProvince = 'tbl_provinces';
  private readonly tableReview = 'tbl_team_review';
  private readonly tableReviewImg = 'tbl_team_review_img';
  private readonly tableService = 'tbl_team_service';
  private readonly tableServiceImg = 'tbl_team_service_img';

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
  async getAll(dto: PagingDto): Promise<TeamResDto[]> {
    let query = ` SELECT A.seq, A.teamCode, A.userCode, A.userTypeCode, A.teamCode, A.teamName, A.teamPhone, A.teamAddress, A.teamImage, A.teamDescription, A.teamDescriptionSpecial, A.provinceCodes,
     A.createdAt, A.updatedAt, A.createdId, A.updatedId , B.userName, D.userTypeKeyWord, D.userTypeName,
     (SELECT GROUP_CONCAT(C.provinceName SEPARATOR ', ') FROM ${this.tableProvince} C WHERE JSON_CONTAINS(A.provinceCodes, JSON_QUOTE(C.provinceCode))) AS provinceName
        FROM ${this.table} A  
          INNER JOIN ${this.tableUser} B
          ON A.userCode = B.userCode 
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
    return (rows as TeamResDto[]).map((row) => ({
      ...row,
      provinceCodes: typeof row.provinceCodes === 'string' ? JSON.parse(row.provinceCodes) : row.provinceCodes,
      teamDescriptionSpecial: typeof row.teamDescriptionSpecial === 'string' ? JSON.parse(row.teamDescriptionSpecial) : row.teamDescriptionSpecial,
    }));
  }
  async getDetail(teamCode: string): Promise<TeamResDto | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.userCode, A.userTypeCode, A.teamCode, A.teamName, A.teamPhone, A.teamAddress, A.teamImage, A.teamDescription, A.teamDescriptionSpecial,
      A.provinceCodes, A.isActive
          FROM ${this.table} A 
          WHERE A.teamCode = ? AND A.isActive = 'Y'
          LIMIT 1 `,
      [teamCode],
    );
    let result = rows ? (rows[0] as TeamResDto) : null;
    if (result) {
      result.provinceCodes = typeof result.provinceCodes === 'string' ? JSON.parse(result.provinceCodes) : result.provinceCodes;
      result.teamDescriptionSpecial = typeof result.teamDescriptionSpecial === 'string' ? JSON.parse(result.teamDescriptionSpecial) : result.teamDescriptionSpecial;
    }
    return result;
  }
  async create(dto: CreateTeamDto, teamImagePath: string, createdId: string): Promise<number> {
    const sqlLast = ` SELECT teamCode FROM ${this.table} ORDER BY teamCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let teamCode = CODES.teamCode.FRIST_CODE;
    if (rows.length > 0) {
      teamCode = generateCode(rows[0].teamCode, CODES.teamCode.PRE, CODES.teamCode.LEN);
    }
    const sql = `
      INSERT INTO ${this.table}  (teamCode, userCode, userTypeCode, teamName, teamPhone, teamAddress, teamImage, teamDescription, teamDescriptionSpecial, provinceCodes, createdId, uniqueId) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      teamCode,
      dto.userCode,
      dto.userTypeCode,
      dto.teamName,
      dto.teamPhone || null,
      dto.teamAddress,
      teamImagePath,
      dto.teamDescription,
      dto.teamDescriptionSpecial ? JSON.stringify(dto.teamDescriptionSpecial) : null,
      typeof dto.provinceCodes === 'string' ? dto.provinceCodes : JSON.stringify(dto.provinceCodes),
      createdId,
      dto.uniqueId,
    ]);

    return result.insertId;
  }
  async update(dto: UpdateTeamDto, teamImagePath: string, updatedId: string, teamCode: string): Promise<number> {
    const sql = `
        UPDATE ${this.table} SET teamName = ?, teamPhone = ?, teamAddress = ?, teamDescription = ?, teamDescriptionSpecial = ?, provinceCodes = ?, teamImage = ?,
        updatedId = ?, updatedAt = ?
        WHERE teamCode = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.teamName,
      dto.teamPhone || null,
      dto.teamAddress,
      dto.teamDescription,
      dto.teamDescriptionSpecial ? JSON.stringify(dto.teamDescriptionSpecial) : null,
      typeof dto.provinceCodes === 'string' ? dto.provinceCodes : JSON.stringify(dto.provinceCodes),
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
  async getTeamFileTypes(): Promise<any[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(`SELECT * FROM ${this.tableFileType}`);
    return rows;
  }

  async getImages(seq: number): Promise<any[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.teamSeq, A.filename, A.originalname, A.size, A.mimetype, A.isActive, A.fileTypeCode
          FROM ${this.tableImg} A 
          WHERE A.teamSeq = ? `,
      [seq],
    );
    return rows;
  }
  async createImages(seq: number, createdId: string, filenamePath: string, file: Express.Multer.File | TeamImgResDto, fileTypeCode?: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableImg} (filename, originalname, size, mimetype, teamSeq, createdId, fileTypeCode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, seq, createdId, fileTypeCode || null]);

    return result.insertId;
  }

  async uploadFileTeam(uniqueId: string, createdId: string, filenamePath: string, file: Express.Multer.File, fileTypeCode?: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableImg} (filename, originalname, size, mimetype, uniqueId, teamSeq, createdId, fileTypeCode)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, uniqueId, createdId, fileTypeCode || null]);
    return result.insertId;
  }

  async deleteFileTeam(seq: number): Promise<number> {
    const sql = `DELETE FROM ${this.tableImg} WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);
    return result.affectedRows;
  }

  async getFileTeamBySeq(seq: number): Promise<any | null> {
    const [rows] = await this.db.execute<any[]>(`SELECT * FROM ${this.tableImg} WHERE seq = ?`, [seq]);
    return rows.length > 0 ? rows[0] : null;
  }

  async updateSeqFilesTeam(teamSeq: number, uniqueId: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableImg} SET teamSeq = ?, updatedId = ?, updatedAt = NOW()
      WHERE uniqueId = ? AND teamSeq = 0 AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [teamSeq, updatedId, uniqueId]);
    return result.affectedRows;
  }

  async findMainImageByUniqueId(uniqueId: string): Promise<any | null> {
    const [rows] = await this.db.execute<any[]>(` SELECT * FROM ${this.tableImg} WHERE uniqueId = ? AND fileTypeCode IS NULL AND teamSeq = 0 LIMIT 1 `, [uniqueId]);
    return rows.length > 0 ? rows[0] : null;
  }

  // TODO: SERVICE
  async createTeamService(seqTeam: number, userTypeCode: string, serviceTypeCode: string, serviceDescription: string, uniqueId?: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableService} (seqTeam, userTypeCode, serviceTypeCode, serviceDescription, uniqueId)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seqTeam, userTypeCode, serviceTypeCode, serviceDescription, uniqueId || null]);
    return result.insertId;
  }

  async createTeamServiceImages(seqService: number, createdId: string, filenamePath: string, file: Express.Multer.File | TeamImgResDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableServiceImg} (seqService, filename, originalname, size, mimetype, createdId)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seqService, filenamePath, file.originalname, file.size, file.mimetype, createdId]);
    return result.insertId;
  }

  async uploadFileService(uniqueId: string, createdId: string, filenamePath: string, file: Express.Multer.File): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableServiceImg} (filename, originalname, size, mimetype, uniqueId, seqService, createdId)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, uniqueId, createdId]);
    return result.insertId;
  }

  async deleteFileService(seq: number): Promise<number> {
    const sql = `DELETE FROM ${this.tableServiceImg} WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);
    return result.affectedRows;
  }

  async getFileServiceBySeq(seq: number): Promise<any | null> {
    const [rows] = await this.db.execute<any[]>(`SELECT * FROM ${this.tableServiceImg} WHERE seq = ?`, [seq]);
    return rows.length > 0 ? rows[0] : null;
  }

  async updateSeqFilesService(seqService: number, uniqueId: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableServiceImg} SET seqService = ?, updatedId = ?, updatedAt = NOW()
      WHERE uniqueId = ? AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seqService, updatedId, uniqueId]);
    return result.affectedRows;
  }

  async getTeamServices(seqTeam: number): Promise<any[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `
      SELECT seq, seqTeam, uniqueId, userTypeCode, serviceTypeCode, serviceDescription
      FROM ${this.tableService} WHERE seqTeam = ?
    `,
      [seqTeam],
    );
    return rows;
  }

  async getTeamServiceImages(seqService: number): Promise<any[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `
      SELECT seq, seqService, filename, originalname, size, mimetype, isActive
      FROM ${this.tableServiceImg} WHERE seqService = ?
    `,
      [seqService],
    );
    return rows;
  }

  async deleteTeamServicesByTeam(seqTeam: number): Promise<number> {
    // Delete services (images will be re-linked via uniqueId)

    // Delete services
    const [result] = await this.db.execute<ResultSetHeader>(`DELETE FROM ${this.tableService} WHERE seqTeam = ?`, [seqTeam]);
    return result.affectedRows;
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
  async getAllReview(dto: PagingDto): Promise<TeamReviewResDto[]> {
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
          INNER JOIN ${this.tableUser} B
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
    return rows as TeamReviewResDto[];
  }
  async getDetailReview(seq: number): Promise<TeamReviewResDto | null> {
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
          INNER JOIN ${this.tableUser} B
            ON A.reviewBy = B.userCode
          LEFT JOIN ${this.table} C
            ON A.teamCode = C.teamCode
          LEFT JOIN ${this.tableUser} D
            ON C.userCode = D.userCode
          WHERE A.isActive = 'Y' AND A.seq = ?
          LIMIT 1
      `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [seq]);
    return rows.length ? (rows[0] as TeamReviewResDto) : null;
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

  async clearTeamMainImage(teamSeq: number): Promise<number> {
    const sql = `UPDATE ${this.table} SET teamImage = '' WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [teamSeq]);
    return result.affectedRows;
  }
}

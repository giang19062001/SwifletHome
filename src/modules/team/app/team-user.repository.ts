import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CODES } from 'src/helpers/const.helper';
import { generateCode } from 'src/helpers/func.helper';
import { GetAllTeamDto } from './team.dto';
import { GetAllTeamResDto, GetDetailTeamResDto } from './team.response';
import { TeamStatusEnum } from 'src/interfaces/admin.interface';

@Injectable()
export class TeamUserAppRepository {
  private readonly table = 'tbl_team_user';
  private readonly tableUserType = 'tbl_user_type';
  private readonly tableTeamImg = 'tbl_team_img';
  private readonly tableReview = 'tbl_team_review';
  private readonly tableService = 'tbl_team_service';
  private readonly tableServiceImg = 'tbl_team_service_img';

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
      query += ` AND JSON_CONTAINS(A.provinceCodes, JSON_QUOTE(?)) `;
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
    let query = ` SELECT A.seq, A.userCode, A.userTypeCode, B.userTypeKeyWord, B.userTypeName, A.teamCode, A.teamName,
    A.teamUserName, A.teamPhone, A.teamAddress,
    A.provinceCodes, IFNULL(CAST(ROUND(AVG(C.star),1) AS DOUBLE), 0) AS star, A.teamImage, A.status
    FROM ${this.table} A 
    LEFT JOIN ${this.tableUserType} B
    ON A.userTypeCode = B.userTypeCode
    LEFT JOIN ${this.tableReview} C
    ON A.teamCode = C.teamCode AND C.isDisplay = 'Y'
    WHERE A.isActive = 'Y'  AND A.userCode != ? AND B.userTypeKeyWord = ?  AND A.status = '${TeamStatusEnum.APPROVE}'`;

    const params: any[] = [userCode, dto.userTypeKeyWord];
    if (dto.provinceCode) {
      query += ` AND JSON_CONTAINS(A.provinceCodes, JSON_QUOTE(?)) `;
      params.push(dto.provinceCode);
    }
    if (dto.txtSearch) {
      query += ` AND A.teamName LIKE ?`;
      params.push(`%${dto.txtSearch}%`);
    }

    query += ` GROUP BY  A.seq, A.userCode, A.userTypeCode, B.userTypeKeyWord, B.userTypeName, A.teamCode, A.teamName, A.teamPhone, A.teamAddress, A.provinceCodes  `;
    query += ` ORDER BY A.seq DESC`;

    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return (rows as GetAllTeamResDto[]).map((row) => ({
      ...row,
      provinceCodes: typeof row.provinceCodes === 'string' ? JSON.parse(row.provinceCodes) : row.provinceCodes,
    }));
  }

  async getDetailTeam(teamCode: string): Promise<GetDetailTeamResDto | null> {
    let query = ` SELECT A.seq, A.userCode, A.userTypeCode, B.userTypeKeyWord, B.userTypeName, 
            A.teamCode, A.teamName, A.teamUserName, A.teamPhone, A.teamAddress,A.provinceCodes,
            IFNULL(R.star, 0) AS star, A.teamDescription, A.teamDescriptionSpecial, A.status,
             A.teamImage,
            COALESCE(
              (
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'seq', D.seq,
                    'filename', D.filename,
                    'mimetype', D.mimetype,
                    'fileTypeCode', D.fileTypeCode
                  )
                )
                FROM ${this.tableTeamImg} D
                WHERE D.teamSeq = A.seq AND D.filename <> A.teamImage
              ),
              JSON_ARRAY()
            ) AS teamFiles

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
          AND A.teamCode = ? AND A.status = '${TeamStatusEnum.APPROVE}'
          LIMIT 1
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [teamCode]);
    let result = rows ? (rows[0] as GetDetailTeamResDto) : null;
    if (result) {
      result.teamFiles = typeof result.teamFiles === 'string' ? JSON.parse(result.teamFiles) : result.teamFiles;
      result.provinceCodes = typeof result.provinceCodes === 'string' ? JSON.parse(result.provinceCodes) : result.provinceCodes;
      result.teamDescriptionSpecial = typeof result.teamDescriptionSpecial === 'string' ? JSON.parse(result.teamDescriptionSpecial) : result.teamDescriptionSpecial;

      // Lấy danh sách dịch vụ và ảnh dịch vụ
      const [services] = await this.db.query<RowDataPacket[]>(`
        SELECT S.seq, S.userTypeCode, S.serviceTypeCode, S.serviceTextInput, O.valueOption as serviceTypeText
        FROM ${this.tableService} S
        LEFT JOIN tbl_option_common O ON S.serviceTypeCode = O.keyOption AND O.mainOption = 'USER_TEAM'
        WHERE S.seqTeam = ?
      `, [result.seq]);

      for (const svc of services) {
        const [svcImages] = await this.db.query<RowDataPacket[]>(`
          SELECT seq, filename, mimetype
          FROM ${this.tableServiceImg} WHERE seqService = ?
        `, [svc.seq]);
        svc.images = svcImages;
      }
      result.services = services as any;
    }
    return result;
  }

  // TODO: TEAM REGISTRATION
  async checkDuplicateTeam(userCode: string, userTypeCode: string): Promise<boolean> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT seq FROM ${this.table} WHERE userCode = ? AND userTypeCode = ?`,
      [userCode, userTypeCode],
    );
    return rows.length > 0;
  }

  async checkAvailableTeam(userCode: string, userTypeCode: string): Promise<{ teamCode: string, status: TeamStatusEnum } | null> {
    const query = ` SELECT teamCode, status FROM ${this.table} 
    WHERE userCode = ? AND userTypeCode = ? AND isActive = 'Y' LIMIT 1 `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [userCode, userTypeCode]);
    return rows.length ? (rows[0] as { teamCode: string, status: TeamStatusEnum }) : null;
  }

  async create(dto: any, userCode: string, teamImagePath: string, createdId: string): Promise<number> {
    const sqlLast = `SELECT teamCode FROM ${this.table} ORDER BY teamCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let teamCode = CODES.teamCode.FRIST_CODE;
    if (rows.length > 0) {
      teamCode = generateCode(rows[0].teamCode, CODES.teamCode.PRE, CODES.teamCode.LEN);
    }
    const sql = `
      INSERT INTO ${this.table} (teamCode, userCode, userTypeCode, teamName, teamUserName, teamPhone, teamAddress, teamImage, teamDescription, teamDescriptionSpecial, provinceCodes, createdId, uniqueId, status) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      teamCode,
      userCode,
      dto.userTypeCode,
      dto.teamName,
      dto.teamUserName,
      dto.teamPhone || null,
      dto.teamAddress,
      teamImagePath,
      dto.teamDescription,
      dto.teamDescriptionSpecial ? JSON.stringify(dto.teamDescriptionSpecial) : null,
      typeof dto.provinceCodes === 'string' ? dto.provinceCodes : JSON.stringify(dto.provinceCodes),
      createdId,
      dto.uniqueId,
      'WAITING',
    ]);
    return result.insertId;
  }

  async createImages(seq: number, createdId: string, filenamePath: string, file: any, fileTypeCode?: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableTeamImg} (filename, originalname, size, mimetype, teamSeq, createdId, fileTypeCode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, seq, createdId, fileTypeCode || null]);
    return result.insertId;
  }

  async findMainImageByUniqueId(uniqueId: string): Promise<any | null> {
    const [rows] = await this.db.execute<any[]>(`SELECT * FROM ${this.tableTeamImg} WHERE uniqueId = ? AND fileTypeCode IS NULL AND teamSeq = 0 LIMIT 1`, [uniqueId]);
    return rows.length > 0 ? rows[0] : null;
  }

  async uploadFileTeam(uniqueId: string, createdId: string, filenamePath: string, file: Express.Multer.File, fileTypeCode?: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableTeamImg} (filename, originalname, size, mimetype, uniqueId, teamSeq, createdId, fileTypeCode)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, uniqueId, createdId, fileTypeCode || null]);
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

  async updateSeqFilesTeam(teamSeq: number, uniqueId: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableTeamImg} SET teamSeq = ?, updatedId = ?, updatedAt = NOW()
      WHERE uniqueId = ? AND teamSeq = 0 AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [teamSeq, updatedId, uniqueId]);
    return result.affectedRows;
  }

  async createTeamService(seqTeam: number, userTypeCode: string, serviceTypeCode: string, serviceTextInput: string, uniqueId?: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableService} (seqTeam, userTypeCode, serviceTypeCode, serviceTextInput, uniqueId)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seqTeam, userTypeCode, serviceTypeCode, serviceTextInput, uniqueId || null]);
    return result.insertId;
  }

  async updateSeqFilesService(seqService: number, uniqueId: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableServiceImg} SET seqService = ?, updatedId = ?, updatedAt = NOW()
      WHERE uniqueId = ? AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seqService, updatedId, uniqueId]);
    return result.affectedRows;
  }

  async getFileTeamBySeq(seq: number): Promise<any | null> {
    const [rows] = await this.db.execute<any[]>(`SELECT * FROM ${this.tableTeamImg} WHERE seq = ?`, [seq]);
    return rows.length > 0 ? rows[0] : null;
  }

  async deleteFileTeam(seq: number): Promise<number> {
    const sql = `DELETE FROM ${this.tableTeamImg} WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);
    return result.affectedRows;
  }

  async getFileServiceBySeq(seq: number): Promise<any | null> {
    const [rows] = await this.db.execute<any[]>(`SELECT * FROM ${this.tableServiceImg} WHERE seq = ?`, [seq]);
    return rows.length > 0 ? rows[0] : null;
  }

  async deleteFileService(seq: number): Promise<number> {
    const sql = `DELETE FROM ${this.tableServiceImg} WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);
    return result.affectedRows;
  }

  async clearTeamMainImage(teamSeq: number): Promise<number> {
    const sql = `UPDATE ${this.table} SET teamImage = '' WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [teamSeq]);
    return result.affectedRows;
  }

  async getTeamFileTypes(userTypeCode: string): Promise<any[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT fileTypeCode, fileTypeText FROM tbl_team_file_type WHERE userTypeCode = ?`,
      [userTypeCode],
    );
    return rows;
  }

  async getFilesNotUseTeam(): Promise<any[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(`SELECT seq, filename FROM ${this.tableTeamImg} WHERE teamSeq = 0`);
    return rows;
  }

  async getFilesNotUseService(): Promise<any[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(`SELECT seq, filename FROM ${this.tableServiceImg} WHERE seqService = 0`);
    return rows;
  }
}

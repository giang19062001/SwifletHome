import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CODES } from 'src/helpers/const.helper';
import { generateCode } from 'src/helpers/func.helper';
import { GetAllTeamDto } from './team.dto';
import { GetAllTeamResDto, GetDetailTeamResDto, TeamFileTypeAppResDto, TeamServiceTypeAppResDto, TeamImgBaseAppResDto, TeamServiceFileBaseAppResDto, TeamFileNotUseAppResDto } from './team.response';
import { TeamStatusEnum, YnEnum } from 'src/interfaces/admin.interface';

@Injectable()
export class TeamUserAppRepository {
  private readonly table = 'tbl_team_user';
  private readonly tableUserType = 'tbl_user_type';
  private readonly tableTeamImg = 'tbl_team_img';
  private readonly tableTeamFile = 'tbl_team_file_type';
  private readonly tableReview = 'tbl_team_review';
  private readonly tableService = 'tbl_team_service';
  private readonly tableServiceFile = 'tbl_team_service_file';
  private readonly tableServiceType = 'tbl_team_service_type';
  private readonly tableProvinces = 'tbl_provinces';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  // TODO: FETCH
  async findTeamByCode(teamCode: string): Promise<boolean> {
    const query = ` 
        SELECT A.seq FROM ${this.table} A  WHERE A.teamCode = ? `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [teamCode]);
    return rows.length ? true : false;
  }
  async getTotalTeams(dto: GetAllTeamDto, userCode: string): Promise<number> {
    let query = ` 
    SELECT COUNT(A.seq) AS TOTAL FROM ${this.table} A  
    LEFT JOIN ${this.tableUserType} B
    ON A.userTypeCode = B.userTypeCode
    WHERE A.isActive = 'Y' AND A.userCode != ? AND B.userTypeKeyWord = ?  AND A.status = '${TeamStatusEnum.APPROVE}'`;

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
    A.provinceCodes, IFNULL(CAST(ROUND(AVG(C.star),1) AS DOUBLE), 0) AS star, A.teamImage, A.status, A.isSeleted
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

    query += ` GROUP BY  A.seq, A.userCode, A.userTypeCode, B.userTypeKeyWord, B.userTypeName, A.teamCode, A.teamName, A.teamUserName, A.teamPhone, A.teamAddress, A.provinceCodes, A.teamImage, A.status, A.isSeleted  `;
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
    const query = ` SELECT A.seq, A.userCode, A.userTypeCode, B.userTypeKeyWord, B.userTypeName, 
            A.teamCode, A.teamName, A.teamUserName, A.teamPhone, A.teamAddress,A.provinceCodes,
            IFNULL(R.star, 0) AS star, A.teamDescription, A.teamDescriptionSpecial, A.status, A.isSeleted,
            A.teamImage,
            TI.seq AS teamImageSeq,
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
                WHERE D.teamSeq = A.seq AND D.filename <> IFNULL(A.teamImage, '')
              ),
              JSON_ARRAY()
            ) AS teamFiles

          FROM ${this.table} A 
          LEFT JOIN ${this.tableUserType} B
            ON A.userTypeCode = B.userTypeCode
          LEFT JOIN ${this.tableTeamImg} TI 
            ON TI.teamSeq = A.seq AND TI.filename = A.teamImage
          LEFT JOIN (
              SELECT 
                teamCode,
                CAST(ROUND(AVG(star),1) AS DOUBLE) AS star
              FROM ${this.tableReview}
              WHERE isActive = 'Y' AND isDisplay = 'Y'
              GROUP BY teamCode
          ) R ON A.teamCode = R.teamCode
          WHERE A.isActive = 'Y'
          AND A.teamCode = ? AND A.status != '${TeamStatusEnum.DRAFT}'
          LIMIT 1
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [teamCode]);
    const result = rows.length ? (rows[0] as GetDetailTeamResDto) : null;
    if (result) {
      result.teamFiles = typeof result.teamFiles === 'string' ? JSON.parse(result.teamFiles) : result.teamFiles;
      result.provinceCodes = typeof result.provinceCodes === 'string' ? JSON.parse(result.provinceCodes) : result.provinceCodes;
      result.teamDescriptionSpecial = typeof result.teamDescriptionSpecial === 'string' ? JSON.parse(result.teamDescriptionSpecial) : result.teamDescriptionSpecial;

      // Lấy danh sách dịch vụ và ảnh dịch vụ
      const [services] = await this.db.query<RowDataPacket[]>(
        `
        SELECT S.seq, S.userTypeCode, S.serviceTypeCode, S.serviceTextInput, S.uniqueId, O.serviceTypeName as serviceTypeText
        FROM ${this.tableService} S
        LEFT JOIN ${this.tableServiceType} O ON S.serviceTypeCode = O.serviceTypeCode
        WHERE S.seqTeam = ?
      `,
        [result.seq],
      );

      for (const svc of services) {
        const [svcImages] = await this.db.query<RowDataPacket[]>(
          `
          SELECT seq, filename, mimetype
          FROM ${this.tableServiceFile} WHERE seqService = ?
        `,
          [svc.seq],
        );
        svc.images = svcImages;
      }
      result.services = services as any;
    }
    return result;
  }

  // TODO: VALIDATE
  async checkDuplicateTeam(userCode: string, userTypeCode: string): Promise<boolean> {
    const [rows] = await this.db.query<RowDataPacket[]>(`SELECT seq FROM ${this.table} WHERE userCode = ? AND userTypeCode = ?`, [userCode, userTypeCode]);
    return rows.length > 0;
  }

  async checkAvailableTeam(userCode: string, userTypeKeyWord: string): Promise<{ teamCode: string; status: TeamStatusEnum } | null> {
    const query = ` SELECT A.teamCode, A.status 
    FROM ${this.table} A
    LEFT JOIN ${this.tableUserType} B ON A.userTypeCode = B.userTypeCode
    WHERE A.userCode = ? AND B.userTypeKeyWord = ? AND A.isActive = 'Y' AND A.status != ? LIMIT 1 `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [userCode, userTypeKeyWord, TeamStatusEnum.DRAFT]);
    return rows.length ? (rows[0] as { teamCode: string; status: TeamStatusEnum }) : null;
  }

  // TODO: DRAFT
  async getDraftSimple(userCode: string, userTypeKeyWord: string): Promise<any | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT A.seq, A.teamCode, A.uniqueId, A.currentStep 
       FROM ${this.table} A 
       JOIN ${this.tableUserType} B ON A.userTypeCode = B.userTypeCode 
       WHERE A.userCode = ? AND B.userTypeKeyWord = ? AND A.status = ? LIMIT 1`,
      [userCode, userTypeKeyWord, TeamStatusEnum.DRAFT],
    );
    return rows.length ? rows[0] : null;
  }

  async getDraft(userCode: string, userTypeKeyWord: string): Promise<GetDetailTeamResDto | null> {
    const query = `
      SELECT A.seq, A.teamCode, A.userCode, A.userTypeCode, A.teamName, A.teamUserName, A.teamPhone, A.teamAddress, 
      A.teamImage, MAX(TI.seq) AS teamImageSeq, A.teamDescription, A.teamDescriptionSpecial, A.provinceCodes, A.uniqueId, A.currentStep,
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
          WHERE D.teamSeq = A.seq AND D.filename <> IFNULL(A.teamImage, '')
        ),
        JSON_ARRAY()
      ) AS teamFiles,
      B.userTypeKeyWord, B.userTypeName,
      GROUP_CONCAT(C.provinceName SEPARATOR ', ') AS provinceName
      FROM ${this.table} A 
      JOIN ${this.tableUserType} B ON A.userTypeCode = B.userTypeCode
      LEFT JOIN ${this.tableProvinces} C ON JSON_CONTAINS(A.provinceCodes, JSON_QUOTE(C.provinceCode))
      LEFT JOIN ${this.tableTeamImg} TI ON TI.teamSeq = A.seq AND TI.filename = A.teamImage
      WHERE A.isActive = 'Y' AND A.userCode = ? AND B.userTypeKeyWord = ? AND A.status = ?
      GROUP BY A.seq
      LIMIT 1
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [userCode, userTypeKeyWord, TeamStatusEnum.DRAFT]);
    const result = rows.length ? (rows[0] as GetDetailTeamResDto) : null;
    if (result) {
      result.teamFiles = typeof result.teamFiles === 'string' ? JSON.parse(result.teamFiles) : result.teamFiles || [];
      result.provinceCodes = typeof result.provinceCodes === 'string' ? JSON.parse(result.provinceCodes) : result.provinceCodes;
      result.teamDescriptionSpecial = typeof result.teamDescriptionSpecial === 'string' ? JSON.parse(result.teamDescriptionSpecial) : result.teamDescriptionSpecial;

      // Lấy danh sách dịch vụ và ảnh dịch vụ
      const [services] = await this.db.query<RowDataPacket[]>(
        `
        SELECT S.seq, S.userTypeCode, S.serviceTypeCode, S.serviceTextInput, S.uniqueId, O.serviceTypeName as serviceTypeText
        FROM ${this.tableService} S
        LEFT JOIN ${this.tableServiceType} O ON S.serviceTypeCode = O.serviceTypeCode
        WHERE S.seqTeam = ?
      `,
        [result.seq],
      );

      for (const svc of services) {
        const [svcImages] = await this.db.query<RowDataPacket[]>(
          `
          SELECT seq, filename, mimetype
          FROM ${this.tableServiceFile} WHERE seqService = ?
        `,
          [svc.seq],
        );
        svc.images = svcImages;
      }
      result.services = services as any;
    }
    return result;
  }

  async createDraft(dto: any, userCode: string, teamImagePath: string, createdId: string): Promise<number> {
    const sqlLast = `SELECT teamCode FROM ${this.table} ORDER BY teamCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let teamCode = CODES.teamCode.FRIST_CODE;
    if (rows.length > 0) {
      teamCode = generateCode(rows[0].teamCode, CODES.teamCode.PRE, CODES.teamCode.LEN);
    }
    const sql = `
      INSERT INTO ${this.table} (teamCode, userCode, userTypeCode, teamName, teamUserName, teamPhone, teamAddress, teamImage, teamDescription, teamDescriptionSpecial, provinceCodes, createdId, uniqueId, status, isSeleted, currentStep) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      teamCode,
      userCode,
      dto.userTypeCode,
      dto.teamName || '',
      dto.teamUserName || '',
      dto.teamPhone || null,
      dto.teamAddress || '',
      teamImagePath || '',
      dto.teamDescription || '',
      dto.teamDescriptionSpecial ? JSON.stringify(dto.teamDescriptionSpecial) : null,
      dto.provinceCodes ? (typeof dto.provinceCodes === 'string' ? dto.provinceCodes : JSON.stringify(dto.provinceCodes)) : '[]',
      createdId,
      dto.uniqueId || '',
      TeamStatusEnum.DRAFT,
      YnEnum.N,
      dto.currentStep || 1,
    ]);
    return result.insertId;
  }

  async updateDraft(seq: number, dto: any, teamImagePath: string, updatedId: string): Promise<number> {
    const updates: string[] = [];
    const params: any[] = [];

    if (dto.teamName !== undefined) {
      updates.push('teamName = ?');
      params.push(dto.teamName);
    }
    if (dto.teamUserName !== undefined) {
      updates.push('teamUserName = ?');
      params.push(dto.teamUserName);
    }
    if (dto.teamPhone !== undefined) {
      updates.push('teamPhone = ?');
      params.push(dto.teamPhone);
    }
    if (dto.teamAddress !== undefined) {
      updates.push('teamAddress = ?');
      params.push(dto.teamAddress);
    }
    if (teamImagePath) {
      updates.push('teamImage = ?');
      params.push(teamImagePath);
    }
    if (dto.teamDescription !== undefined) {
      updates.push('teamDescription = ?');
      params.push(dto.teamDescription);
    }
    if (dto.teamDescriptionSpecial !== undefined) {
      updates.push('teamDescriptionSpecial = ?');
      params.push(JSON.stringify(dto.teamDescriptionSpecial));
    }
    if (dto.provinceCodes !== undefined) {
      updates.push('provinceCodes = ?');
      params.push(typeof dto.provinceCodes === 'string' ? dto.provinceCodes : JSON.stringify(dto.provinceCodes));
    }
    if (dto.currentStep !== undefined) {
      updates.push('currentStep = ?');
      params.push(dto.currentStep);
    }
    if (dto.uniqueId !== undefined) {
      updates.push('uniqueId = ?');
      params.push(dto.uniqueId);
    }

    if (updates.length > 0) {
      updates.push('updatedId = ?');
      params.push(updatedId);
      updates.push('updatedAt = NOW()');

      const sql = `UPDATE ${this.table} SET ${updates.join(', ')} WHERE seq = ? AND status = ?`;
      params.push(seq, TeamStatusEnum.DRAFT);
      await this.db.execute<ResultSetHeader>(sql, params);
    }
    return seq;
  }

  async submitDraft(seq: number, updatedId: string): Promise<number> {
    const sql = `UPDATE ${this.table} SET status = ?, updatedId = ?, updatedAt = NOW() WHERE seq = ? AND status = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [TeamStatusEnum.WAITING, updatedId, seq, TeamStatusEnum.DRAFT]);
    return result.affectedRows;
  }

  // ! WILL DELETE
  async create(dto: any, userCode: string, teamImagePath: string, createdId: string): Promise<number> {
    const sqlLast = `SELECT teamCode FROM ${this.table} ORDER BY teamCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let teamCode = CODES.teamCode.FRIST_CODE;
    if (rows.length > 0) {
      teamCode = generateCode(rows[0].teamCode, CODES.teamCode.PRE, CODES.teamCode.LEN);
    }
    const sql = `
      INSERT INTO ${this.table} (teamCode, userCode, userTypeCode, teamName, teamUserName, teamPhone, teamAddress, teamImage, teamDescription, teamDescriptionSpecial, provinceCodes, createdId, uniqueId, status, isSeleted) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      TeamStatusEnum.WAITING,
      YnEnum.N,
    ]);
    return result.insertId;
  }

  // TODO: CRUD FILE
  async createImages(seq: number, createdId: string, filenamePath: string, file: any, fileTypeCode?: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableTeamImg} (filename, originalname, size, mimetype, teamSeq, createdId, fileTypeCode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, seq, createdId, fileTypeCode || null]);
    return result.insertId;
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
      INSERT INTO ${this.tableServiceFile} (filename, originalname, size, mimetype, uniqueId, seqService, createdId)
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
      UPDATE ${this.tableServiceFile} SET seqService = ?, updatedId = ?, updatedAt = NOW()
      WHERE uniqueId = ? AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seqService, updatedId, uniqueId]);
    return result.affectedRows;
  }

  async deleteFileTeam(seq: number): Promise<number> {
    const sql = `DELETE FROM ${this.tableTeamImg} WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);
    return result.affectedRows;
  }

  async deleteFileService(seq: number): Promise<number> {
    const sql = `DELETE FROM ${this.tableServiceFile} WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);
    return result.affectedRows;
  }
  async deleteServicesByTeamSeq(seqTeam: number): Promise<void> {
    await this.db.execute(`UPDATE ${this.tableServiceFile} SET seqService = 0 WHERE seqService IN (SELECT seq FROM ${this.tableService} WHERE seqTeam = ?)`, [seqTeam]);
    await this.db.execute(`DELETE FROM ${this.tableService} WHERE seqTeam = ?`, [seqTeam]);
  }

  async clearTeamMainImage(teamSeq: number): Promise<number> {
    const sql = `UPDATE ${this.table} SET teamImage = '' WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [teamSeq]);
    return result.affectedRows;
  }

  // TODO: FETCH FILES
  async findMainImageByUniqueId(uniqueId: string): Promise<TeamImgBaseAppResDto | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT seq, teamSeq, uniqueId, fileTypeCode, filename, originalname, size, mimetype, isActive, createdAt, updatedAt, createdId, updatedId FROM ${this.tableTeamImg} WHERE uniqueId = ? AND fileTypeCode IS NULL AND teamSeq = 0 LIMIT 1`,
      [uniqueId],
    );
    return rows.length > 0 ? (rows[0] as TeamImgBaseAppResDto) : null;
  }

  async getFileTeamBySeq(seq: number): Promise<TeamImgBaseAppResDto | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT seq, teamSeq, uniqueId, fileTypeCode, filename, originalname, size, mimetype, isActive, createdAt, updatedAt, createdId, updatedId FROM ${this.tableTeamImg} WHERE seq = ?`,
      [seq],
    );
    return rows.length > 0 ? (rows[0] as TeamImgBaseAppResDto) : null;
  }
  async getFileServiceBySeq(seq: number): Promise<TeamServiceFileBaseAppResDto | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT seq, seqService, uniqueId, filename, originalname, size, mimetype, isActive, createdAt, updatedAt, createdId, updatedId FROM ${this.tableServiceFile} WHERE seq = ?`,
      [seq],
    );
    return rows.length > 0 ? (rows[0] as TeamServiceFileBaseAppResDto) : null;
  }

  async getTeamFileTypes(userTypeKeyWord: string): Promise<TeamFileTypeAppResDto[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT F.fileTypeCode, F.fileTypeText 
       FROM ${this.tableTeamFile} F
       JOIN ${this.tableUserType} U ON F.userTypeCode = U.userTypeCode 
       WHERE U.userTypeKeyWord = ?`,
      [userTypeKeyWord],
    );
    return rows as unknown as TeamFileTypeAppResDto[];
  }

  async getTeamServiceTypes(userTypeKeyWord: string): Promise<TeamServiceTypeAppResDto[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT S.seq, S.userTypeCode, S.serviceTypeCode, S.serviceTypeName 
       FROM ${this.tableServiceType} S
       JOIN ${this.tableUserType} U ON S.userTypeCode = U.userTypeCode
       WHERE U.userTypeKeyWord = ? AND S.isActive = 'Y' 
       ORDER BY S.sortOrder ASC`,
      [userTypeKeyWord],
    );
    return rows as TeamServiceTypeAppResDto[];
  }

  async getFilesNotUseTeam(): Promise<TeamFileNotUseAppResDto[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT seq, filename FROM ${this.tableTeamImg} 
        WHERE teamSeq = 0 OR uniqueId NOT IN (SELECT uniqueId FROM ${this.table} WHERE uniqueId IS NOT NULL)
      `,
    );
    return rows as unknown as TeamFileNotUseAppResDto[];
  }

  async getFilesNotUseService(): Promise<TeamFileNotUseAppResDto[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT seq, filename FROM ${this.tableServiceFile} 
        WHERE seqService = 0 OR uniqueId NOT IN (SELECT uniqueId FROM ${this.tableService} WHERE uniqueId IS NOT NULL)
      `,
    );
    return rows as unknown as TeamFileNotUseAppResDto[];
  }
}

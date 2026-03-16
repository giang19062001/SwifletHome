import { QR_CODE_CONST } from '../qr.interface';
import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { RequestStatusEnum } from '../qr.interface';
import { generateCode } from 'src/helpers/func.helper';
import { CODES } from 'src/helpers/const.helper';
import { GetApprovedRequestQrCodeResDto, RequestQrCodeResDto } from './qr.response';
import { PagingDto } from 'src/dto/admin.dto';
import { QrRequestFileResDto } from './qr.response';

@Injectable()
export class QrRequestAppRepository {
  private readonly table = 'tbl_qr_request';
  private readonly tableFile = 'tbl_qr_request_file';
  private readonly tableBlockChain = 'tbl_qr_request_blockchain';
  private readonly tableSell = 'tbl_qr_request_sell';
  private readonly tableHome = 'tbl_user_home';
  private readonly tableHarvestPhase = 'tbl_todo_task_harvest_phase';
  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  // TODO: REQUEST
  async getRequestQrCocdeTotal(userCode: string): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(DISTINCT A.seq) AS TOTAL
       FROM ${this.table}  A
      LEFT JOIN ${this.tableFile} B
      ON A.seq = B.qrRequestSeq  
      LEFT JOIN ${this.tableBlockChain} C
      ON A.requestCode = C.requestCode  
       LEFT JOIN ${this.tableSell} D
      ON A.requestCode = D.requestCode  
      LEFT JOIN ${this.tableHome} E
      ON A.userHomeCode = E.userHomeCode  
      WHERE A.userCode = ? AND A.isActive = 'Y' AND B.isActive = 'Y'`,
      [userCode],
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }

  async getRequestQrCocdeList(userCode: string, dto: PagingDto): Promise<GetApprovedRequestQrCodeResDto[]> {
    let query = ` SELECT DISTINCT A.seq, A.requestCode, A.userHomeCode, E.userHomeName, F.harvestPhase, F.harvestYear, A.taskMedicineList, A.taskHarvestList, A.requestStatus,
      CASE
        WHEN D.seq IS NOT NULL AND D.isActive = 'Y' THEN '${QR_CODE_CONST.REQUEST_STATUS.SOLD.text}'
        WHEN A.requestStatus = '${QR_CODE_CONST.REQUEST_STATUS.APPROVED.value}'
          THEN '${QR_CODE_CONST.REQUEST_STATUS.APPROVED.text}'
        WHEN A.requestStatus = '${QR_CODE_CONST.REQUEST_STATUS.CANCEL.value}'
          THEN '${QR_CODE_CONST.REQUEST_STATUS.CANCEL.text}'
        WHEN A.requestStatus = '${QR_CODE_CONST.REQUEST_STATUS.WAITING.value}'
          THEN '${QR_CODE_CONST.REQUEST_STATUS.WAITING.text}'
        WHEN A.requestStatus = '${QR_CODE_CONST.REQUEST_STATUS.REFUSE.value}'
          THEN '${QR_CODE_CONST.REQUEST_STATUS.REFUSE.text}'
        ELSE ''
      END AS requestStatusLabel,
       CASE
          WHEN D.seq IS NOT NULL AND D.isActive = 'Y' THEN 'Y'
          ELSE 'N'
      END AS isSold
      FROM ${this.table}  A
      LEFT JOIN ${this.tableFile} B
      ON A.seq = B.qrRequestSeq  
      LEFT JOIN ${this.tableBlockChain} C
      ON A.requestCode = C.requestCode  
       LEFT JOIN ${this.tableSell} D
      ON A.requestCode = D.requestCode  
      LEFT JOIN ${this.tableHome} E
      ON A.userHomeCode = E.userHomeCode  
      LEFT JOIN ${this.tableHarvestPhase} F
      ON A.seqHarvestPhase = F.seq
      WHERE A.userCode = ? AND A.isActive = 'Y' AND B.isActive = 'Y'
      ORDER BY F.harvestPhase DESC, F.harvestYear DESC
     `;

    const params: any[] = [];
    params.push(userCode);
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as GetApprovedRequestQrCodeResDto[];
  }
  async getRequestQrCocde(requestCode: string): Promise<GetApprovedRequestQrCodeResDto | null> {
    let query = ` SELECT A.seq, A.requestCode, A.userHomeCode, E.userHomeName, F.harvestPhase, F.harvestYear, A.taskMedicineList, A.taskHarvestList, A.requestStatus,
      CASE
        WHEN D.seq IS NOT NULL AND D.isActive = 'Y' THEN '${QR_CODE_CONST.REQUEST_STATUS.SOLD.text}'
        WHEN A.requestStatus = '${QR_CODE_CONST.REQUEST_STATUS.APPROVED.value}'
          THEN '${QR_CODE_CONST.REQUEST_STATUS.APPROVED.text}'
        WHEN A.requestStatus = '${QR_CODE_CONST.REQUEST_STATUS.CANCEL.value}'
          THEN '${QR_CODE_CONST.REQUEST_STATUS.CANCEL.text}'
        WHEN A.requestStatus = '${QR_CODE_CONST.REQUEST_STATUS.WAITING.value}'
          THEN '${QR_CODE_CONST.REQUEST_STATUS.WAITING.text}'
        WHEN A.requestStatus = '${QR_CODE_CONST.REQUEST_STATUS.REFUSE.value}'
          THEN '${QR_CODE_CONST.REQUEST_STATUS.REFUSE.text}'
        ELSE ''
      END AS requestStatusLabel,
       CASE
          WHEN D.seq IS NOT NULL AND D.isActive = 'Y' THEN 'Y'
          ELSE 'N'
      END AS isSold
      FROM ${this.table}  A
      LEFT JOIN ${this.tableFile} B
      ON A.seq = B.qrRequestSeq  
      LEFT JOIN ${this.tableBlockChain} C
      ON A.requestCode = C.requestCode  
       LEFT JOIN ${this.tableSell} D
      ON A.requestCode = D.requestCode  
      LEFT JOIN ${this.tableHome} E
      ON A.userHomeCode = E.userHomeCode  
      LEFT JOIN ${this.tableHarvestPhase} F
      ON A.seqHarvestPhase = F.seq
      WHERE A.requestCode = ? AND A.isActive = 'Y' AND B.isActive = 'Y' LIMIT 1
     `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [requestCode]);
    return rows.length ? (rows[0] as GetApprovedRequestQrCodeResDto) : null;
  }
  async getApprovedRequestQrCocde(requestCode: string, userCode: string): Promise<GetApprovedRequestQrCodeResDto | null> {
    let query = ` SELECT A.seq, A.requestCode, A.userCode, A.userName, A.userHomeCode,  E.userHomeName, A.userHomeLength, A.userHomeWidth, A.userHomeFloor,
      A.userHomeAddress, A.temperature, A.humidity, F.harvestPhase, F.harvestYear, A.taskMedicineList, A.taskHarvestList, A.requestStatus,
         CASE
        WHEN D.seq IS NOT NULL AND D.isActive = 'Y' THEN '${QR_CODE_CONST.REQUEST_STATUS.SOLD.text}'
        WHEN A.requestStatus = '${QR_CODE_CONST.REQUEST_STATUS.APPROVED.value}'
          THEN '${QR_CODE_CONST.REQUEST_STATUS.APPROVED.text}'
        WHEN A.requestStatus = '${QR_CODE_CONST.REQUEST_STATUS.CANCEL.value}'
          THEN '${QR_CODE_CONST.REQUEST_STATUS.CANCEL.text}'
        WHEN A.requestStatus = '${QR_CODE_CONST.REQUEST_STATUS.WAITING.value}'
          THEN '${QR_CODE_CONST.REQUEST_STATUS.WAITING.text}'
        WHEN A.requestStatus = '${QR_CODE_CONST.REQUEST_STATUS.REFUSE.value}'
          THEN '${QR_CODE_CONST.REQUEST_STATUS.REFUSE.text}'
        ELSE ''
      END AS requestStatusLabel,
         COALESCE(
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'seq', B.seq,
                'filename', B.filename,
                'mimetype', B.mimetype
              )
            )
            FROM ${this.tableFile} B
            WHERE B.qrRequestSeq = A.seq AND B.isActive = 'Y'
          ),
          JSON_ARRAY()
        ) AS requestQrcodeFiles, IFNULL(C.qrCodeUrl,'') AS qrCodeUrl,
       CASE
          WHEN D.seq IS NOT NULL AND D.isActive = 'Y' THEN 'Y'
          ELSE 'N'
      END AS isSold
      FROM ${this.table}  A 
      LEFT JOIN ${this.tableBlockChain} C
      ON A.requestCode = C.requestCode  
       LEFT JOIN ${this.tableSell} D
      ON A.requestCode = D.requestCode  
        LEFT JOIN ${this.tableHome} E
      ON A.userHomeCode = E.userHomeCode 
      LEFT JOIN ${this.tableHarvestPhase} F
      ON A.seqHarvestPhase = F.seq
      WHERE A.requestCode  = ? AND A.isActive = 'Y'  AND A.requestStatus = ?
      LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [requestCode, RequestStatusEnum.APPROVED]);
    return rows.length ? (rows[0] as GetApprovedRequestQrCodeResDto) : null;
  }
  async checkUsedThisHarvest(userHomeCode: string, userCode: string, harvestPhase: number): Promise<boolean> {
    const currentYear = new Date().getFullYear(); // năm nay
    let query = ` SELECT A.seq
      FROM ${this.table}  A
      LEFT JOIN ${this.tableHarvestPhase} F
      ON A.seqHarvestPhase = F.seq
      WHERE A.userHomeCode  = ? AND A.userCode = ? AND F.harvestPhase = ? AND F.harvestYear = ?
      LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [userHomeCode, userCode, harvestPhase, currentYear]);
    return rows.length > 0;
  }
  async insertRequestQrCode(userCode: string, dto: RequestQrCodeResDto): Promise<number> {
    const sqlLast = ` SELECT requestCode FROM ${this.table} ORDER BY requestCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let requestCode = CODES.requestCode.FRIST_CODE;
    if (rows.length > 0) {
      requestCode = generateCode(rows[0].requestCode, CODES.requestCode.PRE, 6);
    }

    const sql = `
        INSERT INTO ${this.table}  (requestCode, userCode, userName, userHomeCode, userHomeLength, userHomeWidth, userHomeFloor,
        userHomeAddress, temperature, humidity, seqHarvestPhase, taskMedicineList, taskHarvestList, uniqueId, createdId) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
    // prettier-ignore
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      requestCode, userCode, dto.userName,  dto.userHomeCode, dto.userHomeLength, dto.userHomeWidth, dto.userHomeFloor,
      dto.userHomeAddress,  dto.temperature,  dto.humidity, dto.seqHarvestPhase, dto.taskMedicineList,  dto.taskHarvestList, dto.uniqueId, userCode,
    ]);

    return result.insertId;
  }

  // async cancelRequest(requestCode: string, updatedId: string): Promise<number> {
  //   const sql = `
  //     UPDATE ${this.table} SET requestStatus = ? , updatedId = ? , updatedAt = NOW()
  //     WHERE requestCode = ?
  //   `;
  //   const [result] = await this.db.execute<ResultSetHeader>(sql, [RequestStatusEnum.CANCEL, updatedId, requestCode]);

  //   return result.affectedRows;
  // }

  async cancelRequest(seq: number, requestCode: string, userCode: string): Promise<number> {
    // đánh dấu file sẽ bị xóa
    await this.markFileNotUse(seq, userCode);

    // xóa hẵn qrcode
    const sql = `
      DELETE FROM ${this.table}
      WHERE requestCode = ? 
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [requestCode]);
    return result.affectedRows;
  }

  // TODO: FILE
  async getFilesNotUse(): Promise<QrRequestFileResDto[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.qrRequestSeq, A.uniqueId, A.filename, A.mimetype 
            FROM ${this.tableFile} A
          WHERE A.qrRequestSeq = 0 OR A.uniqueId 
          NOT IN (SELECT uniqueId FROM ${this.table})
    `,
    );
    return rows as QrRequestFileResDto[];
  }
  async markFileNotUse(qrRequestSeq: number, updatedId: string): Promise<number> {
    if (!qrRequestSeq) return 0;

    const sql = `
    UPDATE ${this.tableFile}
    SET qrRequestSeq = 0,
        updatedId = ?,
        updatedAt = NOW()
    WHERE qrRequestSeq = ?
      AND qrRequestSeq <> 0
  `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [updatedId, qrRequestSeq]);

    return result.affectedRows ?? 0;
  }
  async deleteFile(seq: number): Promise<number> {
    const sql = `
        DELETE FROM ${this.tableFile}
        WHERE seq = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
  async uploadRequestFile(seq: number, uniqueId: string, userCode: string, filenamePath: string, file: Express.Multer.File | QrRequestFileResDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableFile} (filename, originalname, size, mimetype, uniqueId, qrRequestSeq, userCode, createdId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, uniqueId, seq, userCode, userCode]);

    return result.insertId;
  }
  async findFilesByUniqueId(uniqueId: string): Promise<{ seq: number }[]> {
    const sql = `
      SELECT seq, filename, mimetype FROM ${this.tableFile} WHERE qrRequestSeq = 0 AND isActive = 'Y'  AND uniqueId = ?
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);

    return rows as { seq: number }[];
  }

  async updateSeqFiles(qrRequestSeq: number, seq: number, uniqueId: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableFile} SET qrRequestSeq = ? , updatedId = ? , updatedAt = NOW()
      WHERE seq = ? AND uniqueId = ?  AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [qrRequestSeq, updatedId, seq, uniqueId]);

    return result.affectedRows;
  }
}

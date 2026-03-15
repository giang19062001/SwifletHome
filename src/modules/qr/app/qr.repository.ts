import { GetTypeEnum, MarkTypeEnum, QR_CODE_CONST } from './../qr.interface';
import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { RequestSellStatusEnum, RequestStatusEnum } from '../qr.interface';
import { generateCode } from 'src/helpers/func.helper';
import { CODES } from 'src/helpers/const.helper';
import { GetRequestSellListDto, InsertRequestSellDto } from './qr.dto';
import { GetApprovedRequestQrCodeResDto, GetRequestSellDetailResDto, GetRequestSellListResDto, RequestQrCodeResDto, TaskMedicineQrResDto } from './qr.response';
import { PagingDto } from 'src/dto/admin.dto';

import { YnEnum } from 'src/interfaces/admin.interface';
import { QrRequestFileResDto } from "./qr.response";

@Injectable()
export class QrAppRepository {
  private readonly table = 'tbl_qr_request';
  private readonly tableFile = 'tbl_qr_request_file';
  private readonly tableBlockChain = 'tbl_qr_request_blockchain';
  private readonly tableSell = 'tbl_qr_request_sell';
  private readonly tableOption = 'tbl_option_common';
  private readonly tableHome = 'tbl_user_home';
  private readonly tableInteract = 'tbl_qr_request_sell_interact';
  private readonly tableHarvestPhase = 'tbl_todo_task_harvest_phase'
  constructor(
    @Inject('MYSQL_CONNECTION') private readonly db: Pool,
  ) {}

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

  // TODO: SELL
  async insertRequestSell(userCode: string, dto: InsertRequestSellDto): Promise<number> {
    const sql = `
        INSERT INTO ${this.tableSell}  (userCode, requestCode, userName, userPhone, priceOptionCode, pricePerKg, volumeForSell,
        nestQuantity, humidity, ingredientNestOptionCode, requestSellStatus, createdId) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
    // prettier-ignore
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      userCode, dto.requestCode, dto.userName,  dto.userPhone, dto.priceOptionCode, dto.pricePerKg, dto.volumeForSell,
      dto.nestQuantity,  dto.humidity,  dto.ingredientNestOptionCode, RequestSellStatusEnum.WAITING, userCode,
    ]);

    return result.insertId;
  }

  async getRequestSellTotal(dto: GetRequestSellListDto, userCode: string): Promise<number> {
    let whereSql = '';
    const params: any[] = [];
    whereSql += ' AND E.userCode = ? ';
    params.push(userCode);

    if (dto.getType == GetTypeEnum.VIEW) {
      whereSql += ` AND E.isView = 'Y' `;
    }
    if (dto.getType == GetTypeEnum.SAVE) {
      whereSql += ` AND E.isSave = 'Y' `;
    }

    let query = ` SELECT COUNT(A.seq) AS TOTAL 
      FROM ${this.tableSell}  A
        LEFT JOIN ${this.table} B
       ON A.requestCode = B.requestCode  
      LEFT JOIN ${this.tableHome} C
       ON B.userHomeCode = C.userHomeCode  
      LEFT JOIN ${this.tableOption} D
       ON A.priceOptionCode = D.code
      LEFT JOIN ${this.tableInteract} E
       ON A.requestCode = E.requestCode
      WHERE A.isActive = 'Y' ${whereSql}
     `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getRequestSellList(dto: GetRequestSellListDto, userCode: string): Promise<GetRequestSellListResDto[]> {
    let whereSql = '';
    const params: any[] = [];
    whereSql += ' AND E.userCode = ? ';
    params.push(userCode);

    if (dto.getType == GetTypeEnum.VIEW) {
      whereSql += ` AND E.isView = 'Y' `;
    }
    if (dto.getType == GetTypeEnum.SAVE) {
      whereSql += ` AND E.isSave = 'Y' `;
    }

    let query = ` SELECT DISTINCT A.seq, A.requestCode, A.userCode, A.userName, C.userHomeName, A.userPhone, A.priceOptionCode,
     CASE
        WHEN D.keyOption = '${QR_CODE_CONST.PRICE_OPTION.NEGOTIATE.value}'
          THEN '${QR_CODE_CONST.PRICE_OPTION.NEGOTIATE.text}'
        ELSE  CONCAT(FORMAT(A.pricePerKg, 0), ' đ/ Kg')
      END AS priceOptionLabel, A.pricePerKg, A.volumeForSell, A.nestQuantity,
      A.ingredientNestOptionCode, A.humidity, IFNULL(E.isView,'N') AS isView, IFNULL(E.isSave,'N') AS isSave
      FROM ${this.tableSell}  A
        LEFT JOIN ${this.table} B
       ON A.requestCode = B.requestCode  
      LEFT JOIN ${this.tableHome} C
       ON B.userHomeCode = C.userHomeCode  
      LEFT JOIN ${this.tableOption} D
       ON A.priceOptionCode = D.code
      LEFT JOIN ${this.tableInteract} E
       ON A.requestCode = E.requestCode
      WHERE A.isActive = 'Y'  ${whereSql}
     `;

    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as GetRequestSellListResDto[];
  }
  async getRequestSellDetail(requestCode: string): Promise<GetRequestSellDetailResDto | null> {
    let query = `
     SELECT A.seq, A.requestCode, A.userCode, A.userName, A.userHomeCode,  E.userHomeName, A.userHomeLength, A.userHomeWidth, A.userHomeFloor,
      A.userHomeAddress, A.temperature, A.humidity, H.harvestPhase, H.harvestYear, A.taskMedicineList, A.taskHarvestList, A.requestStatus,
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
      D.priceOptionCode,
      CASE
        WHEN F.keyOption = '${QR_CODE_CONST.PRICE_OPTION.NEGOTIATE.value}'
          THEN '${QR_CODE_CONST.PRICE_OPTION.NEGOTIATE.text}'
        ELSE  CONCAT(FORMAT(D.pricePerKg, 0), ' đ/ Kg')
      END AS priceOptionLabel, D.pricePerKg, D.volumeForSell, D.nestQuantity, D.humidity, 
      D.ingredientNestOptionCode, G.valueOption AS ingredientNestOptionLabel,
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
      LEFT JOIN ${this.tableOption} F
       ON D.priceOptionCode = F.code
      LEFT JOIN ${this.tableOption} G
       ON D.ingredientNestOptionCode = G.code
      LEFT JOIN ${this.tableHarvestPhase} H
      ON A.seqHarvestPhase = H.seq
      WHERE A.requestCode = ? AND A.isActive = 'Y' 
     `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [requestCode]);
    return rows[0] as GetRequestSellDetailResDto;
  }

  // TODO: SELL-INTERACT
  async maskRequestSell(requestCode: string, userCode: string, markType: MarkTypeEnum): Promise<number> {
    const sql = `
    INSERT INTO ${this.tableInteract}
      (requestCode, userCode, isView, isSave, createdId, createdAt, updatedId, updatedAt)
    VALUES (?, ?, 'N', 'N', ?, NOW(), ?, NOW())
    ON DUPLICATE KEY UPDATE
      isView = ${markType === MarkTypeEnum.VIEW ? `'Y'` : 'isView'},
      isSave = ${markType === MarkTypeEnum.SAVE ? `CASE WHEN isSave='Y' THEN 'N' ELSE 'Y' END` : 'isSave'},
      updatedId = VALUES(updatedId),
      updatedAt = NOW()
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [requestCode, userCode, userCode, userCode]);
    return result.affectedRows;
  }
}

import { GetTypeEnum, MarkTypeEnum, QR_CODE_CONST } from './../qr.interface';
import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IQrRequestFile, RequestSellStatusEnum, RequestStatusEnum } from '../qr.interface';
import { generateCode } from 'src/helpers/func.helper';
import { CODES } from 'src/helpers/const.helper';
import { InsertRequestSellDto } from './qr.dto';
import { GetApprovedRequestQrCodeResDto, GetRequestSellListResDto, RequestQrCodeResDto } from './qr.response';

@Injectable()
export class QrAppRepository {
  private readonly table = 'tbl_qr_request';
  private readonly tableFile = 'tbl_qr_request_file';
  private readonly tableBlockChain = 'tbl_qr_request_blockchain';
  private readonly tableSell = 'tbl_qr_request_sell';
  private readonly tableOption = 'tbl_option_common';
  private readonly tableHome = 'tbl_user_home';
  private readonly tableInteract = 'tbl_qr_request_sell_interact';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  // TODO: REQUEST
  async getRequestQrCocdeList(userCode: string): Promise<GetApprovedRequestQrCodeResDto[]> {
    let query = ` SELECT A.seq, A.requestCode, A.userHomeCode, E.userHomeName, A.harvestPhase, A.harvestYear, A.taskMedicineList, A.taskHarvestList, A.requestStatus,
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
      WHERE A.userCode = ? AND A.isActive = 'Y' AND B.isActive = 'Y'
     `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [userCode]);
    return rows as GetApprovedRequestQrCodeResDto[];
  }
  async getRequestQrCocde(requestCode: string): Promise<GetApprovedRequestQrCodeResDto | null> {
    let query = ` SELECT A.seq, A.requestCode, A.userHomeCode, E.userHomeName, A.harvestPhase, A.harvestYear, A.taskMedicineList, A.taskHarvestList, A.requestStatus,
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
      WHERE A.requestCode = ? AND A.isActive = 'Y' AND B.isActive = 'Y' LIMIT 1
     `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [requestCode]);
    return rows.length ? (rows[0] as GetApprovedRequestQrCodeResDto) : null;
  }
  async getApprovedRequestQrCocde(requestCode: string, userCode: string): Promise<GetApprovedRequestQrCodeResDto | null> {
    let query = ` SELECT A.seq, A.requestCode, A.userCode, A.userName, A.userHomeCode,  E.userHomeName, A.userHomeLength, A.userHomeWidth, A.userHomeFloor,
      A.userHomeAddress, A.temperature, A.humidity, A.harvestPhase, A.harvestYear, A.taskMedicineList, A.taskHarvestList, A.requestStatus,
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
       B.filename AS processingPackingVideoUrl, IFNULL(C.qrCodeUrl,'') AS qrCodeUrl,
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
      WHERE A.requestCode  = ? AND A.isActive = 'Y' AND B.isActive = 'Y' AND A.requestStatus = ?
      LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [requestCode, RequestStatusEnum.APPROVED]);
    return rows.length ? (rows[0] as GetApprovedRequestQrCodeResDto) : null;
  }
  async checkDuplicateReuqestQrCode(userHomeCode: string, userCode: string, harvestPhase: number): Promise<boolean> {
    let query = ` SELECT A.seq
      FROM ${this.table}  A
      WHERE A.userHomeCode  = ? AND A.userCode = ? AND A.harvestPhase = ?
      LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [userHomeCode, userCode, harvestPhase]);
    return rows.length ? true : false;
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
        userHomeAddress, temperature, humidity, harvestPhase, harvestYear, taskMedicineList, taskHarvestList, uniqueId, createdId) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
    // prettier-ignore
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      requestCode, userCode, dto.userName,  dto.userHomeCode, dto.userHomeLength, dto.userHomeWidth, dto.userHomeFloor,
      dto.userHomeAddress,  dto.temperature,  dto.humidity, dto.harvestPhase, dto.harvestYear, dto.taskMedicineList,  dto.taskHarvestList, dto.uniqueId, userCode,
    ]);

    return result.insertId;
  }

  async cancelRequest(requestCode: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET requestStatus = ? , updatedId = ? , updatedAt = NOW()
      WHERE requestCode = ? 
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [RequestStatusEnum.CANCEL, updatedId, requestCode]);

    return result.affectedRows;
  }

  // TODO: FILE
  async getFilesNotUse(): Promise<IQrRequestFile[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.qrRequestSeq, A.uniqueId, A.filename, A.mimetype 
            FROM ${this.tableFile} A
          WHERE A.qrRequestSeq = 0 OR A.uniqueId 
          NOT IN (SELECT uniqueId FROM ${this.table})
    `,
    );
    return rows as IQrRequestFile[];
  }
  async deleteFile(seq: number): Promise<number> {
    const sql = `
        DELETE FROM ${this.tableFile}
        WHERE seq = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);

    return result.affectedRows;
  }
  async uploadRequestVideo(seq: number, uniqueId: string, userCode: string, filenamePath: string, file: Express.Multer.File | IQrRequestFile): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableFile} (filename, originalname, size, mimetype, uniqueId, qrRequestSeq, userCode, createdId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, uniqueId, seq, userCode, userCode]);

    return result.insertId;
  }
  async findFilesByUniqueId(uniqueId: string): Promise<{ seq: number; filename: string; mimetype: string } | null> {
    const sql = `
      SELECT seq, filename, mimetype FROM ${this.tableFile} WHERE qrRequestSeq = 0 AND uniqueId = ? LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);

    return rows ? (rows[0] as { seq: number; filename: string; mimetype: string }) : null;
  }
  async updateSeqFiles(qrRequestSeq: number, seq: number, uniqueId: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableFile} SET qrRequestSeq = ? , updatedId = ? , updatedAt = NOW()
      WHERE seq = ? AND uniqueId = ?
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
  async getRequestSellList(getType: GetTypeEnum, userCode: string): Promise<GetRequestSellListResDto[]> {
    let query = ` SELECT A.seq, A.requestCode, A.userCode, A.userName, C.userHomeName, A.userPhone, A.priceOptionCode,
     CASE
        WHEN D.keyOption = '${QR_CODE_CONST.PRICE_OPTION.NEGOTIATE.value}'
          THEN '${QR_CODE_CONST.PRICE_OPTION.NEGOTIATE.text}'
        ELSE  CONCAT(FORMAT(A.pricePerKg, 0), ' đ/ Kg')
      END AS priceOptionLabel, A.pricePerKg, A.volumeForSell, A.nestQuantity,
      A.ingredientNestOptionCode, A.humidity
      FROM ${this.tableSell}  A
        LEFT JOIN ${this.table} B
       ON A.requestCode = B.requestCode  
      LEFT JOIN ${this.tableHome} C
       ON B.userHomeCode = C.userHomeCode  
      LEFT JOIN ${this.tableOption} D
       ON A.priceOptionCode = D.code
      LEFT JOIN ${this.tableInteract} E
       ON A.requestCode = E.requestCode
      WHERE A.isActive = 'Y' ${getType !== GetTypeEnum.ALL ? ' AND A.userCode = ? ' : ''}
     `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, getType !== GetTypeEnum.ALL ? [userCode] : []);
    return rows as GetRequestSellListResDto[];
  }

  // TODO: SELL-INTERACT
  async maskRequestSell(requestCode: string, userCode: string, markType: MarkTypeEnum): Promise<number> {
    const filed = markType == MarkTypeEnum.VIEW ? ` isView = 'Y' ` : ` isSave = 'Y' `;
    const sql = `
      UPDATE ${this.tableInteract} SET ${filed} , updatedId = ? , updatedAt = NOW()
      WHERE requestCode = ? AND userCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [RequestStatusEnum.CANCEL, userCode, requestCode, userCode]);

    return result.affectedRows;
  }
}

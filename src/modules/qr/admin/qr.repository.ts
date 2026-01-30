import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { IQrRequest } from './qr.inteface';
import { QR_CODE_CONST, RequestStatusEnum } from '../qr.interface';
import { GetAllInfoRequestQrCodeAdminResDto, WriteQrBlockchainDto } from './qr.dto';
import { UPDATOR } from 'src/helpers/const.helper';

@Injectable()
export class QrAdminRepository {
  private readonly table = 'tbl_qr_request';
  private readonly tableFile = 'tbl_qr_request_file';
  private readonly tableBlockChain = 'tbl_qr_request_blockchain';
  private readonly tableSell = 'tbl_qr_request_sell';
  private readonly tableUserApp = 'tbl_user_app';
  private readonly tableUserHome = 'tbl_user_home';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IQrRequest[]> {
    let query = ` SELECT A.seq, A.requestCode, A.userCode, A.userName, A.userHomeCode, B.userHomeName, A.userHomeLength, A.userHomeWidth, A.userHomeFloor,
        A.userHomeAddress, A.temperature, A.humidity, A.harvestPhase, A.requestStatus,
        IFNULL(JSON_LENGTH(A.taskMedicineList), 0) AS taskMedicineCount, A.createdAt
        FROM ${this.table}  A
        LEFT JOIN ${this.tableUserHome} B
        ON A.userHomeCode = B.userHomeCode  
        WHERE  A.isActive = 'Y' 
        ORDER BY A.createdAt DESC `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IQrRequest[];
  }
  async getDetail(requestCode: string): Promise<GetAllInfoRequestQrCodeAdminResDto | null> {
    let query = ` SELECT A.seq, A.requestCode, A.userCode, A.userName, A.userHomeCode, B.userHomeName, A.userHomeLength, A.userHomeWidth, A.userHomeFloor,
        A.userHomeAddress, A.temperature, A.humidity, A.harvestPhase, A.requestStatus,
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
        A.taskMedicineList, A.taskHarvestList, C.filename AS processingPackingVideoUrl,
        CASE
          WHEN D.transactionHash IS NULL THEN ''
          ELSE CONCAT('${process.env.BLOCKCHAIN_NET}/tx/', D.transactionHash)
        END
        AS transactionHash, A.createdAt
        FROM ${this.table}  A
        LEFT JOIN ${this.tableUserHome} B
        ON A.userHomeCode = B.userHomeCode  
          LEFT JOIN ${this.tableFile} C
        ON A.seq = C.qrRequestSeq  
         LEFT JOIN ${this.tableBlockChain} D
        ON A.requestCode = D.requestCode  
         LEFT JOIN ${this.tableSell} E
      ON A.requestCode = E.requestCode  
        WHERE A.requestCode = ? AND A.isActive = 'Y' AND C.isActive = 'Y'
        `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [requestCode]);
    return rows.length ? (rows[0] as GetAllInfoRequestQrCodeAdminResDto) : null;
  }
  async updateRequsetStatus(requestCode: string, requestStatus: RequestStatusEnum, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.table} SET requestStatus = ? , updatedId = ? , updatedAt = NOW()
      WHERE requestCode = ?
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [requestStatus, updatedId, requestCode]);

    return result.affectedRows;
  }

  // TODO: BLOCKCHAIN
 async writeQrBlockchain(dto: WriteQrBlockchainDto): Promise<number> {
  const sql = `
    INSERT INTO ${this.tableBlockChain}
      (requestCode, userCode, userHomeCode, qrCodeUrl, transactionHash, blockNumber, transactionFee, createdId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      userCode = VALUES(userCode),
      userHomeCode = VALUES(userHomeCode),
      qrCodeUrl = VALUES(qrCodeUrl),
      transactionHash = VALUES(transactionHash),
      blockNumber = VALUES(blockNumber),
      transactionFee = VALUES(transactionFee),
      updatedId = ?
  `;

  const [result] = await this.db.execute<ResultSetHeader>(sql, [
    dto.requestCode,
    dto.userCode,
    dto.userHomeCode,
    dto.qrCodeUrl,
    dto.transactionHash,
    dto.blockNumber,
    dto.transactionFee,
    UPDATOR,
    UPDATOR  
  ]);
  return result.insertId;
}

}

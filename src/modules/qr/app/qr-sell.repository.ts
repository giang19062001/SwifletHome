import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { YnEnum } from 'src/interfaces/admin.interface';
import { RequestSellStatusEnum } from '../qr.interface';
import { GetTypeEnum, MarkTypeEnum, QR_CODE_CONST, RequestStatusEnum } from './../qr.interface';
import { GetRequestSellListDto, InsertRequestSellDto } from './qr.dto';
import { GetRequestSellDetailResDto, GetRequestSellListResDto } from './qr.response';

@Injectable()
export class QrSellAppRepository {
  private readonly table = 'tbl_qr_request';
  private readonly tableFile = 'tbl_qr_request_file';
  private readonly tableBlockChain = 'tbl_qr_request_blockchain';
  private readonly tableSell = 'tbl_qr_request_sell';
  private readonly tableOption = 'tbl_option_common';
  private readonly tableHome = 'tbl_user_home';
  private readonly tableInteract = 'tbl_qr_request_sell_interact';
  private readonly tableHarvestPhase = 'tbl_todo_task_harvest_phase';
  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  // TODO: SELL
  async checkIsApprovedAndIsSold(requestCode: string): Promise<{ seq: number; isSold: YnEnum } | null> {
    let query = ` SELECT A.seq,
         CASE
            WHEN D.seq IS NOT NULL AND D.isActive = 'Y' THEN 'Y'
            ELSE 'N'
        END AS isSold
        FROM ${this.table}  A 
         LEFT JOIN ${this.tableSell} D
         ON A.requestCode = D.requestCode  
        WHERE A.requestCode  = ? AND A.isActive = 'Y'  AND A.requestStatus = ?
        LIMIT 1 `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [requestCode, RequestStatusEnum.APPROVED]);
    return rows.length ? (rows[0] as { seq: number; isSold: YnEnum }) : null;
  }

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
    params.push(userCode); // placeholder for the JOIN: ON ... AND E.userCode = ?

    whereSql += ' AND A.userCode != ? ';
    params.push(userCode); // placeholder for the WHERE: AND A.userCode != ?

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
        ON A.requestCode = E.requestCode AND E.userCode = ?
        WHERE A.isActive = 'Y' ${whereSql} 
     `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }

  async getRequestSellList(dto: GetRequestSellListDto, userCode: string): Promise<GetRequestSellListResDto[]> {
    let whereSql = '';
    const params: any[] = [];
    params.push(userCode); // placeholder for the JOIN: ON ... AND E.userCode = ?

    whereSql += ' AND A.userCode != ? ';
    params.push(userCode); // placeholder for the WHERE: AND A.userCode != ?

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
        ON A.requestCode = E.requestCode AND E.userCode = ?
        WHERE A.isActive = 'Y'  ${whereSql}
        ORDER BY A.seq DESC
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
    // 1. Kiểm tra xem đã có bản ghi tương tác chưa
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT seq, isView, isSave FROM ${this.tableInteract} WHERE requestCode = ? AND userCode = ? LIMIT 1`,
      [requestCode, userCode],
    );

    if (rows.length > 0) {
      // 2. Nếu đã có, tiến hành UPDATE
      const existing = rows[0];
      let sql = `UPDATE ${this.tableInteract} SET updatedAt = NOW(), updatedId = ? `;
      const params: any[] = [userCode];

      if (markType === MarkTypeEnum.VIEW) {
        sql += `, isView = 'Y' `;
      } else if (markType === MarkTypeEnum.SAVE) {
        // Toggle isSave
        const nextSave = existing.isSave === YnEnum.Y ? YnEnum.N : YnEnum.Y;
        sql += `, isSave = ? `;
        params.push(nextSave);
      }

      sql += ` WHERE seq = ? `;
      params.push(existing.seq);

      const [result] = await this.db.execute<ResultSetHeader>(sql, params);
      return result.affectedRows;
    } else {
      // 3. Nếu chưa có, tiến hành INSERT
      const isView = markType === MarkTypeEnum.VIEW ? YnEnum.Y : YnEnum.N;
      const isSave = markType === MarkTypeEnum.SAVE ? YnEnum.Y : YnEnum.N;

      const sql = `
        INSERT INTO ${this.tableInteract} (requestCode, userCode, isView, isSave, createdId, updatedId)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await this.db.execute<ResultSetHeader>(sql, [requestCode, userCode, isView, isSave, userCode, userCode]);
      return result.insertId;
    }
  }
}

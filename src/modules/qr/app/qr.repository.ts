import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IQrRequestFile, RequestSellStatusEnum, RequestStatusEnum } from '../qr.interface';
import { generateCode } from 'src/helpers/func.helper';
import { CODES } from 'src/helpers/const.helper';
import { GetAllInfoRequestQrCodeResDto, InsertRequestSellDto, RequestQrCodeFromDbDto } from '../qr.dto';

@Injectable()
export class QrAppRepository {
  private readonly table = 'tbl_qr_request';
  private readonly tableFile = 'tbl_qr_request_file';
  private readonly tableBlockChain = 'tbl_qr_request_blockchain';
  private readonly tableSell = 'tbl_qr_request_sell';
  private readonly tableUserApp = 'tbl_user_app';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  // TODO: REQUEST
  async getApprovedRequestQrCocde(requestCode: string, userCode: string): Promise<GetAllInfoRequestQrCodeResDto | null> {
    let query = ` SELECT A.seq, A.requestCode, A.userCode, A.userName, A.userHomeCode, A.userHomeLength, A.userHomeWidth, A.userHomeFloor,
      A.userHomeAddress, A.temperature, A.humidity, A.harvestPhase, A.taskMedicineList, A.taskHarvestList, A.requestStatus,
       B.filename AS processingPackingVideoUrl, IFNULL(C.qrCodeUrl,'') AS qrCodeUrl
      FROM ${this.table}  A
      LEFT JOIN ${this.tableFile} B
      ON A.seq = B.qrRequestSeq  
      LEFT JOIN ${this.tableBlockChain} C
      ON A.requestCode = C.requestCode  
      WHERE A.requestCode  = ? AND A.userCode = ? AND A.isActive = 'Y' AND B.isActive = 'Y' AND A.requestStatus = ?
      LIMIT 1 `;

    // const [rows] = await this.db.query<RowDataPacket[]>(query, [requestCode, userCode, RequestStatusEnum.APPROVED]);

    // ! TEST
    const [rows] = await this.db.query<RowDataPacket[]>(query, [requestCode, userCode, RequestStatusEnum.WAITING]);

    return rows.length ? (rows[0] as GetAllInfoRequestQrCodeResDto) : null;
  }
  async checkDuplicateReuqestQrCode(userHomeCode: string, userCode: string, harvestPhase: number): Promise<boolean> {
    let query = ` SELECT A.seq
      FROM ${this.table}  A
      WHERE A.userHomeCode  = ? AND A.userCode = ? AND A.harvestPhase = ?
      LIMIT 1 `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [userHomeCode, userCode, harvestPhase]);
    return rows.length ? true : false;
  }
  async insertRequestQrCode(userCode: string, dto: RequestQrCodeFromDbDto): Promise<number> {
    const sqlLast = ` SELECT requestCode FROM ${this.table} ORDER BY requestCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let requestCode = CODES.requestCode.FRIST_CODE;
    if (rows.length > 0) {
      requestCode = generateCode(rows[0].requestCode, CODES.requestCode.PRE, 6);
    }

    const sql = `
        INSERT INTO ${this.table}  (requestCode, userCode, userName, userHomeCode, userHomeLength, userHomeWidth, userHomeFloor,
        userHomeAddress, temperature, humidity, harvestPhase, taskMedicineList, taskHarvestList, uniqueId, createdId) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
    // prettier-ignore
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      requestCode, userCode, dto.userName,  dto.userHomeCode, dto.userHomeLength, dto.userHomeWidth, dto.userHomeFloor,
      dto.userHomeAddress,  dto.temperature,  dto.humidity, dto.harvestPhase, dto.taskMedicineList,  dto.taskHarvestList, dto.uniqueId, userCode,
    ]);

    return result.insertId;
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
}

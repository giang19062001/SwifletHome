import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CreateTradeDto, GetTradeListDto } from './trade.dto';
import { TradeInteractTypeEnum, TradeListTypeEnum } from '../trade.enum';

@Injectable()
export class TradeAppRepository {
  private readonly tableTrade = 'tbl_trade';
  private readonly tableFile = 'tbl_trade_file';
  private readonly tableInteract = 'tbl_trade_interact';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async findActiveFileByUniqueId(uniqueId: string): Promise<RowDataPacket | null> {
    const sql = `SELECT seq, filename, tradeSeq FROM ${this.tableFile} WHERE uniqueId = ? AND isActive = 'Y' ORDER BY seq DESC LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);
    return rows[0] || null;
  }

  async findUnlinkedFilesByUniqueId(uniqueId: string): Promise<RowDataPacket[]> {
    const sql = `SELECT seq, filename FROM ${this.tableFile} WHERE uniqueId = ? AND tradeSeq = 0 AND isActive = 'Y'`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);
    return rows;
  }

  async insertFile(tradeSeq: number, userCode: string, uniqueId: string, filename: string, originalname: string, size: number, mimetype: string, createdId: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableFile}
        (tradeSeq, userCode, uniqueId, filename, originalname, size, mimetype, createdId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [tradeSeq, userCode, uniqueId, filename, originalname, size, mimetype, createdId]);
    return result.insertId;
  }

  async getFileBySeq(seq: number): Promise<RowDataPacket | null> {
    const sql = `SELECT seq, filename, userCode, createdId, tradeSeq, uniqueId FROM ${this.tableFile} WHERE seq = ? AND isActive = 'Y' LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [seq]);
    return rows[0] || null;
  }

  async deleteFileBySeq(seq: number): Promise<number> {
    const sql = `DELETE FROM ${this.tableFile} WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);
    return result.affectedRows;
  }

  async createTrade(dto: CreateTradeDto, userCode: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableTrade}
        (userCode, sellerName, sellerPhone, price, mass, nestQuantity, uniqueId, status, createdId)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'SELLING', ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, dto.sellerName, dto.sellerPhone, dto.price, dto.mass, dto.nestQuantity, dto.uniqueId, userCode]);
    return result.insertId;
  }

  async bindFileToTrade(tradeSeq: number, uniqueId: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableFile}
      SET tradeSeq = ?, updatedId = ?, updatedAt = NOW()
      WHERE uniqueId = ? AND tradeSeq = 0 AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [tradeSeq, updatedId, uniqueId]);
    return result.affectedRows;
  }

  async getTradeList(dto: GetTradeListDto, currentUserCode: string): Promise<{ list: RowDataPacket[]; total: number }> {
    const page = Math.max(1, Number(dto.page) || 1);
    const limit = Math.max(1, Number(dto.limit) || 10);
    const offset = (page - 1) * limit;

    const type = dto.type || TradeListTypeEnum.ALL;

    let joinClause = '';
    const conditions: string[] = ["T.isActive = 'Y'"];
    const countParams: any[] = [];
    const listParams: any[] = [currentUserCode, currentUserCode];

    if (type === TradeListTypeEnum.SAVED) {
      joinClause = `JOIN ${this.tableInteract} I ON I.tradeSeq = T.seq AND I.userCode = ? AND I.type = '${TradeInteractTypeEnum.SAVED}' AND I.isActive = 'Y'`;
      countParams.push(currentUserCode);
    } else if (type === TradeListTypeEnum.SEEN) {
      joinClause = `JOIN ${this.tableInteract} I ON I.tradeSeq = T.seq AND I.userCode = ? AND I.type = '${TradeInteractTypeEnum.SEEN}' AND I.isActive = 'Y'`;
      countParams.push(currentUserCode);
    }

    const whereClause = conditions.join(' AND ');

    const countSql = `
      SELECT COUNT(DISTINCT T.seq) AS total
      FROM ${this.tableTrade} T
      ${joinClause}
      WHERE ${whereClause}
    `;
    const [countRows] = await this.db.query<RowDataPacket[]>(countSql, countParams);
    const total = countRows[0]?.total || 0;

    const listSql = `
      SELECT
        T.seq,
        T.userCode,
        T.sellerName,
        T.sellerPhone,
        T.price,
        T.mass,
        T.nestQuantity,
        T.status,
        T.createdAt,
        T.updatedAt,
        COALESCE(
          (SELECT F.filename FROM ${this.tableFile} F WHERE F.tradeSeq = T.seq AND F.isActive = 'Y' ORDER BY F.seq DESC LIMIT 1),
          ''
        ) AS tradeNestImage,
        (CASE WHEN T.userCode = ? THEN 1 ELSE 0 END) AS isMine,
        EXISTS(
          SELECT 1 FROM ${this.tableInteract} I2
          WHERE I2.tradeSeq = T.seq AND I2.userCode = ? AND I2.type = '${TradeInteractTypeEnum.SAVED}' AND I2.isActive = 'Y'
        ) AS isSaved
      FROM ${this.tableTrade} T
      ${joinClause}
      WHERE ${whereClause}
      ORDER BY T.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    // Nếu có joinClause cần params cho joinClause
    let fullListParams: any[] = [];
    if (type === TradeListTypeEnum.SAVED || type === TradeListTypeEnum.SEEN) {
      fullListParams = [currentUserCode, currentUserCode, currentUserCode, limit, offset];
    } else {
      fullListParams = [currentUserCode, currentUserCode, limit, offset];
    }

    const [rows] = await this.db.query<RowDataPacket[]>(listSql, fullListParams);
    return { list: rows, total };
  }

  async getTradeDetail(seq: number, currentUserCode: string): Promise<RowDataPacket | null> {
    const sql = `
      SELECT
        T.seq,
        T.userCode,
        T.sellerName,
        T.sellerPhone,
        T.price,
        T.mass,
        T.nestQuantity,
        T.status,
        T.createdAt,
        T.updatedAt,
        COALESCE(
          (SELECT F.filename FROM ${this.tableFile} F WHERE F.tradeSeq = T.seq AND F.isActive = 'Y' ORDER BY F.seq DESC LIMIT 1),
          ''
        ) AS tradeNestImage,
        (CASE WHEN T.userCode = ? THEN 1 ELSE 0 END) AS isMine,
        EXISTS(
          SELECT 1 FROM ${this.tableInteract} I
          WHERE I.tradeSeq = T.seq AND I.userCode = ? AND I.type = '${TradeInteractTypeEnum.SAVED}' AND I.isActive = 'Y'
        ) AS isSaved
      FROM ${this.tableTrade} T
      WHERE T.seq = ? AND T.isActive = 'Y'
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [currentUserCode, currentUserCode, seq]);
    return rows[0] || null;
  }

  async findInteract(tradeSeq: number, userCode: string, type: TradeInteractTypeEnum): Promise<RowDataPacket | null> {
    const sql = `
      SELECT seq
      FROM ${this.tableInteract}
      WHERE tradeSeq = ? AND userCode = ? AND type = ? AND isActive = 'Y'
      LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [tradeSeq, userCode, type]);
    return rows[0] || null;
  }

  async deleteInteract(tradeSeq: number, userCode: string, type: TradeInteractTypeEnum): Promise<number> {
    const sql = `DELETE FROM ${this.tableInteract} WHERE tradeSeq = ? AND userCode = ? AND type = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [tradeSeq, userCode, type]);
    return result.affectedRows;
  }

  async insertInteract(tradeSeq: number, userCode: string, type: TradeInteractTypeEnum): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableInteract}
        (tradeSeq, userCode, type, createdId)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE updatedAt = NOW()
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [tradeSeq, userCode, type, userCode]);
    return result.affectedRows;
  }

  async updateInteractUpdatedAt(tradeSeq: number, userCode: string, type: TradeInteractTypeEnum): Promise<number> {
    const sql = `
      UPDATE ${this.tableInteract}
      SET updatedAt = NOW(), updatedId = ?
      WHERE tradeSeq = ? AND userCode = ? AND type = ? AND isActive = 'Y'
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, tradeSeq, userCode, type]);
    return result.affectedRows;
  }

  async getFilesNotUse(): Promise<{ seq: number; filename: string }[]> {
    const sql = `
      SELECT seq, filename
      FROM ${this.tableFile}
      WHERE tradeSeq = 0 OR uniqueId NOT IN (SELECT uniqueId FROM ${this.tableTrade} WHERE uniqueId IS NOT NULL)
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(sql);
    return rows as { seq: number; filename: string }[];
  }

  async deleteFileCron(seq: number): Promise<number> {
    return await this.deleteFileBySeq(seq);
  }
}

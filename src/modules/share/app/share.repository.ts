import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

@Injectable()
export class ShareAppRepository {
  private readonly table = 'tbl_share';
  private readonly tableHarvestPhare = 'tbl_todo_task_harvest_phase';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) { }

  async getShareByDetails(seqShare: number, shareType: string): Promise<any> {
    const query = `
      SELECT seq, shareToken, seqShare, shareType, isActive 
      FROM ${this.table}
      WHERE seqShare = ? AND shareType = ? AND isActive = 'Y'
      LIMIT 1
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [seqShare, shareType]);
    return rows.length ? rows[0] : null;
  }

  async getShareByToken(shareToken: string): Promise<any> {
    const query = `
      SELECT seq, shareToken, seqShare, shareType, isActive 
      FROM ${this.table}
      WHERE shareToken = ? AND isActive = 'Y'
      LIMIT 1
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [shareToken]);
    return rows.length ? rows[0] : null;
  }


  async insertShare(shareToken: string, seqShare: number, shareType: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.table} (shareToken, seqShare, shareType)
      VALUES (?, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [shareToken, seqShare, shareType]);
    return result.insertId;
  }

  async getHarvestPhaseBySeq(seqHarvestPhase: number): Promise<any> {
    const query = `
      SELECT seq, userHomeCode, harvestPhase, harvestYear
      FROM ${this.tableHarvestPhare}
      WHERE seq = ? AND isActive = 'Y'
      LIMIT 1
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [seqHarvestPhase]);
    return rows.length ? rows[0] : null;
  }
    async checkHarvestPhaseExist(seqHarvestPhase: number, userHomeCode: string, harvestPhase: number, harvestYear: number): Promise<boolean> {
    const query = `
      SELECT seq FROM ${this.tableHarvestPhare}
      WHERE seq = ? AND userHomeCode = ? AND harvestPhase = ? AND harvestYear = ? AND isActive = 'Y'
      LIMIT 1
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [seqHarvestPhase, userHomeCode, harvestPhase, harvestYear]);
    return rows.length > 0;
  }
}

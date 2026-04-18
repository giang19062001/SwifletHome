import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { GetHarvertReportDto } from './report.dto';
import { GetHarvertReportDetailResDto, GetHarvertReportSummaryResDto } from './report.response';

@Injectable()
export class ReportAppRepository {
  private readonly tableTaskHarvest = 'tbl_todo_task_harvest';
  private readonly tableTaskHarvestPhase = 'tbl_todo_task_harvest_phase';
  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getHarvertReportSummary(dto: GetHarvertReportDto, userCode: string): Promise<GetHarvertReportSummaryResDto | GetHarvertReportDetailResDto[]> {
    let params: (string | number)[] = [dto.userHomeCode, userCode, dto.harvestYear];
    let query = ` 
        SELECT C.harvestPhase, C.harvestYear,
            CAST(IFNULL(SUM(D.cellCollected), 0) AS SIGNED) AS totalCellCollected
        FROM ${this.tableTaskHarvestPhase} C
        INNER JOIN ${this.tableTaskHarvest} D
          ON C.seq = D.seqHarvestPhase
        WHERE C.userHomeCode = ?
          AND C.userCode = ? AND C.harvestYear = ?
          AND C.isDone = 'Y'
        GROUP BY C.harvestPhase, C.harvestYear
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as GetHarvertReportSummaryResDto | GetHarvertReportDetailResDto[];
  }

  async getHarvertReportDetail(dto: GetHarvertReportDto, userCode: string): Promise<GetHarvertReportSummaryResDto | GetHarvertReportDetailResDto[]> {
    let params: (string | number)[] = [dto.userHomeCode, userCode, dto.harvestYear];
    let query = ` 
        SELECT C.harvestPhase, C.harvestYear,
            CAST(IFNULL(SUM(D.cellCollected), 0) AS SIGNED) AS totalCellCollected,
            CASE 
          WHEN COUNT(D.seq) = 0 THEN JSON_ARRAY()
          ELSE JSON_ARRAYAGG(
                JSON_OBJECT(
                  'floor', D.floor,
                  'cell', D.cell,
                  'cellCollected', D.cellCollected
                )
              )
        END AS cellCollectedByfloor
        FROM ${this.tableTaskHarvestPhase} C
        INNER JOIN ${this.tableTaskHarvest} D
          ON C.seq = D.seqHarvestPhase
        WHERE C.userHomeCode = ?
          AND C.userCode = ? AND C.harvestYear = ?
          AND C.isDone = 'Y'
        GROUP BY C.harvestPhase, C.harvestYear
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as GetHarvertReportSummaryResDto | GetHarvertReportDetailResDto[];
  }
}

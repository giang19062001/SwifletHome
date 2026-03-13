import { Inject, Injectable } from '@nestjs/common';
import { GetHarvertReportDto } from './report.dto';
import { GetHarvertReportDetailResDto, GetHarvertReportSummaryResDto } from './report.response';
import { TODO_CONST } from 'src/modules/todo/todo.interface';
import type { Pool, RowDataPacket } from 'mysql2/promise';

@Injectable()
export class ReportAppRepository {
  private readonly tableUserApp = 'tbl_user_app';
  private readonly tableTask = 'tbl_todo_tasks';
  private readonly tableBoxTask = 'tbl_todo_box_tasks';
  private readonly tableTaskAlarm = 'tbl_todo_task_alarm';
  private readonly tableTaskHarvest = 'tbl_todo_task_harvest';
  private readonly tableTaskHarvestPhase = 'tbl_todo_task_harvest_phase';
  private readonly tableQr = 'tbl_qr_request';
  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getHarvertReportSummary(dto: GetHarvertReportDto, userCode: string): Promise<GetHarvertReportSummaryResDto | GetHarvertReportDetailResDto[]> {
    let params: (string | number)[] = [dto.userHomeCode, userCode, dto.harvestYear];
    let query = ` 
        SELECT C.harvestPhase,  C.harvestYear,
            CAST(IFNULL(SUM(D.cellCollected), 0) AS SIGNED) AS totalCellCollected
        FROM ${this.tableTaskAlarm} A
        INNER JOIN ${this.tableTask} B
          ON A.taskCode = B.taskCode
          AND B.taskKeyword = '${TODO_CONST.TASK_EVENT.HARVEST.value}'
        INNER JOIN ${this.tableTaskHarvestPhase} C
          ON A.seq = C.seqAlarm
          AND C.isDone = 'Y'
        INNER JOIN ${this.tableTaskHarvest} D
          ON A.seq = D.seqAlarm
        WHERE A.userHomeCode = ?
          AND A.userCode = ? AND C.harvestYear = ?
        GROUP BY C.harvestPhase, C.harvestYear
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as GetHarvertReportSummaryResDto | GetHarvertReportDetailResDto[];
  }
   async getHarvertReportDetail(dto: GetHarvertReportDto, userCode: string): Promise<GetHarvertReportSummaryResDto | GetHarvertReportDetailResDto[]> {
    let params: (string | number)[] = [dto.userHomeCode, userCode, dto.harvestYear];
    let query = ` 
        SELECT C.harvestPhase,  C.harvestYear,
            CAST(IFNULL(SUM(D.cellCollected), 0) AS SIGNED) AS totalCellCollected,
            CASE 
          WHEN COUNT(B.seq) = 0 THEN JSON_ARRAY()
          ELSE JSON_ARRAYAGG(
                JSON_OBJECT(
                  'floor', D.floor,
                  'cell', D.cell,
                  'cellCollected', D.cellCollected
                )
              )
        END AS cellCollectedByfloor
        FROM ${this.tableTaskAlarm} A
        INNER JOIN ${this.tableTask} B
          ON A.taskCode = B.taskCode
          AND B.taskKeyword = '${TODO_CONST.TASK_EVENT.HARVEST.value}'
        INNER JOIN ${this.tableTaskHarvestPhase} C
          ON A.seq = C.seqAlarm
          AND C.isDone = 'Y'
        INNER JOIN ${this.tableTaskHarvest} D
          ON A.seq = D.seqAlarm
        WHERE A.userHomeCode = ?
          AND A.userCode = ?  AND C.harvestYear = ?
        GROUP BY C.harvestPhase, C.harvestYear
    `;
    console.log(query, userCode);
    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as GetHarvertReportSummaryResDto | GetHarvertReportDetailResDto[];
  }
}

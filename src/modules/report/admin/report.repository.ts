import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { ReportOverviewResDto } from './report.response';

@Injectable()
export class ReportAdminRepository {
  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  private async getMonthlySeries(tableName: string, monthCount: number = 10, whereClause: string = ''): Promise<number[]> {
    const query = `
      SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(seq) as total 
      FROM ${tableName} 
      WHERE isActive = 'Y' ${whereClause}
        AND createdAt >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ${monthCount - 1} MONTH), '%Y-%m-01')
      GROUP BY month
      ORDER BY month ASC
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query);

    const result: number[] = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      const found = rows.find((r) => r.month === monthStr);
      result.push(found ? Number(found.total) : 0);
    }
    return result;
  }
  private async getMonthlyHarvestSeries(sumColumn: 'cellCollected' | 'cellRemain', monthCount: number = 6): Promise<number[]> {
    const query = `
      SELECT DATE_FORMAT(A.createdAt, '%Y-%m') as month, SUM(IFNULL(B.${sumColumn}, 0)) as total 
      FROM tbl_todo_task_harvest_phase A
      LEFT JOIN tbl_todo_task_harvest B ON A.seq = B.seqHarvestPhase
      WHERE A.isActive = 'Y' AND A.taskStatus = 'COMPLETE'
        AND A.createdAt >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ${monthCount - 1} MONTH), '%Y-%m-01')
      GROUP BY month
      ORDER BY month ASC
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query);

    const result: number[] = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      const found = rows.find((r) => r.month === monthStr);
      result.push(found ? Number(found.total) : 0);
    }
    return result;
  }

  async getOverview(): Promise<ReportOverviewResDto> {
    const [
      [userRows], [homeRows], [consultationRows], [consignmentRows], [doctorRows], [sightseeingRows], [teamApproveRows], [teamWaitRows], [saleHomeApprovedRows], [saleHomeWaitingRows],
      totalUserSeries, totalUserHomeSeries, totalGuestConsulationSeries, totalConsignmentSeries, totalDoctorSeries, totalSightseeingSeries,
      mediaUserHomeSeries, mediaSaleHomeApprovedSeries, mediaSaleHomeWaitingSeries,
      areaQrWaitingSeries, areaQrApprovedSeries, areaQrSellingSeries,
      barHarvestCollectedSeries, barHarvestRemainSeries,
    ] = await Promise.all([
      this.db.query<RowDataPacket[]>(`SELECT COUNT(seq) as total FROM tbl_user_app WHERE isActive = 'Y'`),
      this.db.query<RowDataPacket[]>(`SELECT COUNT(seq) as total FROM tbl_user_home WHERE isActive = 'Y'`),
      this.db.query<RowDataPacket[]>(`SELECT COUNT(seq) as total FROM tbl_guest_consulation WHERE isActive = 'Y'`),
      this.db.query<RowDataPacket[]>(`SELECT COUNT(seq) as total FROM tbl_consignment WHERE isActive = 'Y'`),
      this.db.query<RowDataPacket[]>(`SELECT COUNT(seq) as total FROM tbl_doctor WHERE isActive = 'Y'`),
      this.db.query<RowDataPacket[]>(`SELECT COUNT(seq) as total FROM tbl_sale_home_sightseeing WHERE isActive = 'Y'`),
      this.db.query<RowDataPacket[]>(`SELECT COUNT(seq) as total FROM tbl_team_user WHERE isActive = 'Y' AND status = 'APPROVE'`),
      this.db.query<RowDataPacket[]>(`SELECT COUNT(seq) as total FROM tbl_team_user WHERE isActive = 'Y' AND status = 'WAITING'`),
      this.db.query<RowDataPacket[]>(`SELECT COUNT(seq) as total FROM tbl_sale_home WHERE isActive = 'Y' AND status = 'APPROVED'`),
      this.db.query<RowDataPacket[]>(`SELECT COUNT(seq) as total FROM tbl_sale_home WHERE isActive = 'Y' AND status = 'WAITING'`),

      this.getMonthlySeries('tbl_user_app', 10),
      this.getMonthlySeries('tbl_user_home', 10),
      this.getMonthlySeries('tbl_guest_consulation', 10),
      this.getMonthlySeries('tbl_consignment', 10),
      this.getMonthlySeries('tbl_doctor', 10),
      this.getMonthlySeries('tbl_sale_home_sightseeing', 10),

      this.getMonthlySeries('tbl_user_home', 6),
      this.getMonthlySeries('tbl_sale_home', 6, " AND status = 'APPROVED'"),
      this.getMonthlySeries('tbl_sale_home', 6, " AND status = 'WAITING'"),

      this.getMonthlySeries('tbl_qr_request', 6, " AND requestStatus = 'WAITING'"),
      this.getMonthlySeries('tbl_qr_request', 6, " AND requestStatus = 'APPROVED'"),
      this.getMonthlySeries('tbl_qr_request_selling', 6),

      this.getMonthlyHarvestSeries('cellCollected', 6),
      this.getMonthlyHarvestSeries('cellRemain', 6),
    ]);

    const radialUserSeries = [Number(userRows[0].total), Number(teamApproveRows[0].total), Number(teamWaitRows[0].total)];

    return {
      totalUser: userRows[0].total,
      totalUserHome: homeRows[0].total,
      totalGuestConsulation: consultationRows[0].total,
      totalConsignment: consignmentRows[0].total,
      totalDoctor: doctorRows[0].total,
      totalUserSeries,
      totalUserHomeSeries,
      totalGuestConsulationSeries,
      totalConsignmentSeries,
      totalDoctorSeries,
      mediaUserHomeSeries,
      mediaSaleHomeApprovedSeries,
      mediaSaleHomeWaitingSeries,
      radialUserSeries,
      totalSightseeing: sightseeingRows[0].total,
      totalSightseeingSeries,
      areaQrWaitingSeries,
      areaQrApprovedSeries,
      areaQrSellingSeries,
      barHarvestCollectedSeries,
      barHarvestRemainSeries,
      totalSaleHomeApproved: saleHomeApprovedRows[0].total,
      totalSaleHomeWaiting: saleHomeWaitingRows[0].total,
    };
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { ReportOverviewResDto } from './report.dto';

@Injectable()
export class ReportAdminRepository {
  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getOverview(): Promise<ReportOverviewResDto> {
    const [userRows] = await this.db.query<RowDataPacket[]>(`SELECT COUNT(seq) as total FROM tbl_user_app WHERE isActive = 'Y'`);
    const [homeRows] = await this.db.query<RowDataPacket[]>(`SELECT COUNT(seq) as total FROM tbl_user_home WHERE isActive = 'Y'`);
    const [consultationRows] = await this.db.query<RowDataPacket[]>(`SELECT COUNT(seq) as total FROM tbl_guest_consulation WHERE isActive = 'Y'`);
    const [consignmentRows] = await this.db.query<RowDataPacket[]>(`SELECT COUNT(seq) as total FROM tbl_consignment WHERE isActive = 'Y'`);

    return {
      totalUser: userRows[0].total,
      totalUserHome: homeRows[0].total,
      totalGuestConsulation: consultationRows[0].total,
      totalConsignment: consignmentRows[0].total,
    };
  }
}

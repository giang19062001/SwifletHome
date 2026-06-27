import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { GetAdsBannerDto } from './ads.dto';
import { AdsBannerResDto } from './ads.response';

@Injectable()
export class AdsAppRepository {
  private readonly tableAdsBanner = 'tbl_ads_banner';
  private readonly tableFile = 'tbl_ads_file';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getBanners(dto: GetAdsBannerDto): Promise<AdsBannerResDto[]> {
    const query = `
      SELECT A.seq, A.title, B.filename as bannerUrl, A.position, A.displayOrder, A.startTime, A.endTime,
       A.targetScreen, A.actionType, A.actionValue
      FROM ${this.tableAdsBanner} A
      LEFT JOIN ${this.tableFile} B ON A.seq = B.adsSeq AND B.isActive = 'Y'
      WHERE A.targetScreen = ? 
        AND A.isActive = 'Y' 
        AND A.startTime < NOW() 
        AND A.endTime > NOW()
      ORDER BY A.displayOrder ASC
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [dto.targetScreen]);
    return rows as AdsBannerResDto[];
  }
}

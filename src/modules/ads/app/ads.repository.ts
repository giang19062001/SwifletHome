import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { GetAdsBannerDto } from './ads.dto';
import { AdsBannerResDto } from './ads.response';

@Injectable()
export class AdsAppRepository {
  private readonly tableAdsBanner = 'tbl_ads_banner';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getBanners(dto: GetAdsBannerDto): Promise<AdsBannerResDto[]> {
    const query = `
      SELECT seq, title, bannerUrl, position, displayOrder, startTime, endTime,
       targetScreen, actionType, actionValue
      FROM ${this.tableAdsBanner}
      WHERE targetScreen = ? 
        AND isActive = 'Y' 
        AND startTime < NOW() 
        AND endTime > NOW()
      ORDER BY seq DESC
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(query, [dto.targetScreen]);
    return rows as AdsBannerResDto[];
  }
}

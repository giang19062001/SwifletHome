import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin';
import { IHome, IHomeImg } from '../home.interface';

@Injectable()
export class HomeAppRepository {
  private readonly table = 'tbl_home';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IHome[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT  A.seq, A.homeCode, A.homeName, A.homeAddress,A.homeDescription, A.latitude, A.longitude, A.homeImage, A.isActive,
          COALESCE(
              JSON_ARRAYAGG(
                  JSON_OBJECT('seq', B.seq,'filename', B.filename,'mimetype', B.mimetype)
              ),
              '[]'
          ) AS homeImages
      FROM tbl_home A
      LEFT JOIN tbl_home_img B ON A.seq = B.homeSeq
      GROUP BY 
          A.seq, A.homeCode, A.homeName, A.homeAddress, A.homeDescription, A.latitude, A.longitude, A.homeImage, A.isActive 
         ${dto.limit == 0 && dto.page == 0 ? '' : 'LIMIT ? OFFSET ?'} `,
      dto.limit == 0 && dto.page == 0 ? [] : [dto.limit, (dto.page - 1) * dto.limit],
    );

    const result = (rows as IHome[]).map((row) => ({
      ...row,
      homeImages: typeof row.homeImages === 'string' ? JSON.parse(row.homeImages) : row.homeImages,
    }));

    return result;
  }

  async getDetail(homeCode: string): Promise<IHome | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT  A.seq, A.homeCode, A.homeName, A.homeAddress,A.homeDescription, A.latitude, A.longitude, A.homeImage, A.isActive,
          COALESCE(
              JSON_ARRAYAGG(
                  JSON_OBJECT('seq', B.seq,'filename', B.filename,'mimetype', B.mimetype)
              ),
              '[]'
          ) AS homeImages
      FROM tbl_home A
      LEFT JOIN tbl_home_img B ON A.seq = B.homeSeq
      WHERE A.homeCode = ? 
      GROUP BY 
          A.seq, A.homeCode, A.homeName, A.homeAddress, A.homeDescription, A.latitude, A.longitude, A.homeImage, A.isActive 
      LIMIT 1
        `,
      [homeCode],
    );

    let result = rows ? (rows[0] as IHome) : null;
    if (result) {
      result.homeImages = typeof result.homeImages === 'string' ? JSON.parse(result.homeImages) : result.homeImages;
    }
    return result;
  }
}

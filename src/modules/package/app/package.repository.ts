import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { PackageResDto } from "../package.response";

@Injectable()
export class PackageAppRepository {
  private readonly table = 'tbl_package';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getOne(): Promise<PackageResDto> {
    let query = ` SELECT A.seq, A.packageCode, A.packageName, A.packagePrice, A.packageItemSamePrice,
              A.packageOptionType, A.packageExpireDay, A.packageDescription
               FROM ${this.table} A
               WHERE A.isActive = 'Y' 
               LIMIT 1 `;

    const params: any[] = [];

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows[0] as PackageResDto;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { IPackage } from '../package.interface';

@Injectable()
export class PackageAppRepository {
  private readonly table = 'tbl_package';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getAll(dto: PagingDto): Promise<IPackage[]> {
    let query = ` SELECT A.seq, A.packageCode, A.packageName, A.packagePrice, A.packageItemSamePrice, A.packageExpireDay, A.packageDescription
               FROM ${this.table} A
               WHERE A.isActive = 'Y' `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IPackage[];
  }
}

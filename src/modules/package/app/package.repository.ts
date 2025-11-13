import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/common';
import { IPackage } from '../package.interface';

@Injectable()
export class PackageAppRepository {
  private readonly table = 'tbl_package';
  private readonly updator = 'SYSTEM';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}
  async getAll(dto: PagingDto): Promise<IPackage[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.packageCode, A.packageName, A.packagePrice, A.packageExpireDay, A.packageDescription
        FROM ${this.table} A WHERE A.isActive = 'Y'
        LIMIT ? OFFSET ? `,
      [dto.limit, (dto.page - 1) * dto.limit],
    );
    return rows as IPackage[];
  }
}

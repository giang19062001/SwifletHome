import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { GetOptionDto } from './option.dto';
import { IOpition } from './option.interface';

@Injectable()
export class OptionRepository {
  private readonly table = 'tbl_option_common';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {
  }
  async getAll(dto: GetOptionDto): Promise<IOpition[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.code, A.mainOption, A.subOption, A.keyOption, A.valueOption, A.sortOrder
        FROM ${this.table} A
        WHERE A.mainOption = ? AND A.subOption = ? ${'keyOption' in dto && dto.keyOption ? 'AND A.keyOption = ?' : ''}
        AND A.isDelete = 'Y' 
        ORDER BY A.sortOrder ASC`,
        'keyOption' in dto && dto.keyOption ? [dto.mainOption, dto.subOption, dto.keyOption] : [dto.mainOption, dto.subOption],
    );
    return rows as IOpition[];
  }
}

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { GetAllCodeDto } from './code.dto';
import { ICode } from './code.interface';

@Injectable()
export class CodeRepository {
  private readonly table = 'tbl_code_common';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getAll(dto: GetAllCodeDto): Promise<ICode[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.code, A.mainCode, A.subCode, A.keyCode, A.valueCode, A.sortOrder, A.isActive
        FROM ${this.table} A
        WHERE A.mainCode = ? AND A.subCode = ?
        AND A.isActive = 'Y' 
        ORDER BY A.sortOrder ASC`,[dto.mainCode, dto.subCode],
    );
    return rows as ICode[];
  }
 
}

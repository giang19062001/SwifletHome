import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { GetCodeDto } from './code.dto';
import { ICode } from './code.interface';
import { AbAdminRepo } from 'src/abstract/common';

@Injectable()
export class CodeRepository extends AbAdminRepo {
  private readonly table = 'tbl_code_common';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {
    super();
  }

  async getAll(dto: GetCodeDto): Promise<ICode[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT A.seq, A.code, A.mainCode, A.subCode, A.keyCode, A.valueCode, A.sortOrder, A.isActive
        FROM ${this.table} A
        WHERE A.mainCode = ? AND A.subCode = ? ${'keyCode' in dto && dto.keyCode ? 'AND A.keyCode = ?' : ''}
        AND A.isActive = 'Y' 
        ORDER BY A.sortOrder ASC`,
        'keyCode' in dto && dto.keyCode ? [dto.mainCode, dto.subCode, dto.keyCode] : [dto.mainCode, dto.subCode],
    );
    return rows as ICode[];
  }

  getTotal(dto?: any): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getDetail(dto: string | number): Promise<any | null> {
    throw new Error('Method not implemented.');
  }
  create(dto: any): Promise<number> {
    throw new Error('Method not implemented.');
  }
  update(dto: any, id: string | number): Promise<number> {
    throw new Error('Method not implemented.');
  }
  delete(dto: string | number): Promise<number> {
    throw new Error('Method not implemented.');
  }
}

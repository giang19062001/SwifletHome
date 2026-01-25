import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { GetApprovedRequestQrCodeResDto } from '../qr.dto';
import { PagingDto } from 'src/dto/admin.dto';
import { IAllQrRequest } from './qr.inteface';

@Injectable()
export class QrAdminRepository {
  private readonly table = 'tbl_qr_request';
  private readonly tableFile = 'tbl_qr_request_file';
  private readonly tableBlockChain = 'tbl_qr_request_blockchain';
  private readonly tableSell = 'tbl_qr_request_sell';
  private readonly tableUserApp = 'tbl_user_app';
  private readonly tableUserHome = 'tbl_user_home';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IAllQrRequest[]> {
    let query = ` SELECT A.seq, A.requestCode, A.userCode, A.userName, A.userHomeCode, B.userHomeName, A.userHomeLength, A.userHomeWidth, A.userHomeFloor,
        A.userHomeAddress, A.temperature, A.humidity, A.harvestPhase, A.requestStatus,
        IFNULL(JSON_LENGTH(A.taskMedicineList), 0) AS taskMedicineCount, A.createdAt
        FROM ${this.table}  A
        LEFT JOIN ${this.tableUserHome} B
        ON A.userHomeCode = B.userHomeCode  
        WHERE  A.isActive = 'Y' 
        ORDER BY A.createdAt DESC `;

    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IAllQrRequest[];
  }
}

import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { IConsignment } from './consignment.interface';

@Injectable()
export class ConsignmentAdminRepository {
  private readonly table = 'tbl_consignment';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<IConsignment[]> {
    let query = ` SELECT A.seq, A.consignmentCode, A.userCode, A.senderName, A.senderPhone, A.nestQuantity, A.deliveryAddress, A.receiverName,
     A.receiverPhone, A.consignmentStatus, A.isActive, A.createdAt 
        FROM ${this.table} A  
        WHERE A.isActive = 'Y'
        ORDER BY A.createdAt DESC `;
    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as IConsignment[];
  }
}

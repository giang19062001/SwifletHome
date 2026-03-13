import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { ConsignmentResDto } from "./consignment.response";

@Injectable()
export class ConsignmentAdminRepository {
  private readonly table = 'tbl_consignment';
  private readonly tableDelivering = 'tbl_consignment_delivering';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<ConsignmentResDto[]> {
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
    return rows as ConsignmentResDto[];
  }
   async getDetail(consignmentCode: string): Promise<ConsignmentResDto | null> {
    let query = ` SELECT A.seq, A.consignmentCode, A.userCode, A.senderName, A.senderPhone, A.nestQuantity, A.deliveryAddress, A.receiverName,
     A.receiverPhone, A.consignmentStatus, A.isActive, A.createdAt,
         CASE 
          WHEN COUNT(B.seq) = 0 THEN JSON_ARRAY()
          ELSE JSON_ARRAYAGG(
                JSON_OBJECT(
                  'seq', B.seq,
                  'address', B.address
                )
              )
        END AS deliveringAddressList 
        FROM ${this.table} A  
        LEFT JOIN ${this.tableDelivering} B
          ON A.consignmentCode = B.consignmentCode
          AND B.isActive = 'Y'
        WHERE A.isActive = 'Y' AND A.consignmentCode = ?
        ORDER BY A.createdAt DESC `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [consignmentCode]);
    return rows.length ? rows[0] as ConsignmentResDto : null;
  }
}

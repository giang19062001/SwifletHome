import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { PagingDto } from 'src/dto/admin.dto';
import { ConsignmentStatusEnum } from '../app/consigment.interface';
import { UpdateConsignmentDto } from './consignment.dto';
import { GetAllConsignmentResDto } from './consignment.response';

@Injectable()
export class ConsignmentAdminRepository {
  private readonly table = 'tbl_consignment';
  private readonly tableDelivering = 'tbl_consignment_delivering';
  private readonly tableOption = 'tbl_option_common';
  private readonly tableHistory = 'tbl_consignment_history';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getTotal(): Promise<number> {
    const [rows] = await this.db.query<RowDataPacket[]>(` SELECT COUNT(seq) AS TOTAL FROM ${this.table}`);
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: PagingDto): Promise<GetAllConsignmentResDto[]> {
    let query = ` SELECT A.seq, A.consignmentCode, A.userCode, A.senderName, A.senderPhone, A.nestQuantity, A.deliveryAddress,
     A.receiverName, A.receiverPhone, A.consignmentStatus, A.isActive, DATE_FORMAT(A.createdAt, '%Y-%m-%d %H:%i:%s') as createdAt,
     C.valueOption AS nestTypeLabel
        FROM ${this.table} A  
        INNER JOIN ${this.tableOption} C
          ON A.nestType = C.code
        WHERE A.isActive = 'Y'
        ORDER BY A.createdAt DESC `;
    const params: any[] = [];
    if (dto.limit > 0 && dto.page > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(dto.limit, (dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(query, params);
    return rows as GetAllConsignmentResDto[];
  }
  async getDetail(consignmentCode: string): Promise<GetAllConsignmentResDto | null> {
    let query = ` SELECT A.seq, A.consignmentCode, A.userCode, A.senderName, A.senderPhone, A.nestQuantity, A.deliveryAddress, A.receiverName,
     A.receiverPhone, A.consignmentStatus, A.isActive, DATE_FORMAT(A.createdAt, '%Y-%m-%d %H:%i:%s') as createdAt, C.valueOption AS nestTypeLabel,
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
        INNER JOIN ${this.tableOption} C
          ON A.nestType = C.code
        LEFT JOIN ${this.tableDelivering} B
          ON A.consignmentCode = B.consignmentCode
          AND B.isActive = 'Y'
        WHERE A.isActive = 'Y' AND A.consignmentCode = ?
        ORDER BY A.createdAt DESC `;

    const [rows] = await this.db.query<RowDataPacket[]>(query, [consignmentCode]);
    if (!rows.length || !rows[0].consignmentCode) return null;

    const data = rows[0] as any;
    if (data.deliveringAddressList) {
      try {
        data.deliveringAddressList = typeof data.deliveringAddressList === 'string' ? JSON.parse(data.deliveringAddressList) : data.deliveringAddressList;
      } catch (e) {
        data.deliveringAddressList = [];
      }
    }

    return data as GetAllConsignmentResDto;
  }

  async update(consignmentCode: string, dto: UpdateConsignmentDto): Promise<number> {
    const connection = await this.db.getConnection();
    await connection.beginTransaction();
    try {
      // cập nhập trạng thái
      const [updateResult] = await connection.query<any>(` UPDATE ${this.table} SET consignmentStatus = ?, updatedAt = NOW() WHERE consignmentCode = ? AND isActive = 'Y'`, [
        dto.consignmentStatus,
        consignmentCode,
      ]);

      // ghi lịch sử
      if (dto.consignmentStatus != ConsignmentStatusEnum.DELIVERING) {
        await connection.query(
          `
        INSERT INTO ${this.tableHistory} (consignmentCode, address, consignmentStatus, createdId) 
        VALUES(?, ?, ?, ?) `,
          [consignmentCode, null, dto.consignmentStatus, dto.userCode],
        );
      }

      if (updateResult.affectedRows === 0) {
        throw new Error('Consignment not found');
      }

      if (dto.deliveringAddressList) {
        // chỉ Insert địa chỉ mới
        const newList = dto.deliveringAddressList.filter((item) => !item.seq);
        if (newList.length > 0) {
          // ghi lịch sử
          for (const item of newList) {
            await connection.query(`INSERT INTO ${this.tableHistory} (consignmentCode, address, consignmentStatus, createdId) VALUES(?, ?, ?, ?)`, [
              consignmentCode,
              item.address,
              dto.consignmentStatus,
              dto.userCode,
            ]);
          }
          // ghi địa chỉ mới
          const values = newList.map((item) => [consignmentCode, item.address, 'Y', dto.userCode || 'SYSTEM']);
          await connection.query(` INSERT INTO ${this.tableDelivering} (consignmentCode, address, isActive, createdId) VALUES ?`, [values]);
        }
      }

      await connection.commit();
      return 1;
    } catch (error) {
      console.log('ConsignmentAdminService - update: ', error);
      await connection.rollback();
      return 0;
    } finally {
      connection.release();
    }
  }
}

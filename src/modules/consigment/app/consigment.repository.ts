import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CODES } from 'src/helpers/const.helper';
import { generateCode } from 'src/helpers/func.helper';
import { GetAllConsignmentDto, RequestConsigmentDto } from './consigment.dto';
import { ConsignmentStatusEnum } from './consigment.interface';
import { ConsignmentResDto } from './consignment.response';

@Injectable()
export class ConsignmentAppRepository {
  private readonly table = 'tbl_consignment';
  private readonly tableDelivering = 'tbl_consignment_delivering';
  private readonly tableOption = 'tbl_option_common';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async requestConsigment(userCode: string, dto: RequestConsigmentDto): Promise<number> {
    const sqlLast = ` SELECT consignmentCode FROM ${this.table} ORDER BY consignmentCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let consignmentCode = CODES.consignmentCode.FRIST_CODE;
    if (rows.length > 0) {
      consignmentCode = generateCode(rows[0].consignmentCode, CODES.consignmentCode.PRE, 6);
    }

    const sql = `
       INSERT INTO ${this.table}  (userCode, consignmentCode, senderName, senderPhone, nestType, nestQuantity, deliveryAddress, receiverName,
        receiverPhone, consignmentStatus, createdId) 
       VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      userCode,
      consignmentCode,
      dto.senderName,
      dto.senderPhone,
      dto.nestType,
      dto.nestQuantity,
      dto.deliveryAddress,
      dto.receiverName,
      dto.receiverPhone,
      ConsignmentStatusEnum.WAITING,
      userCode,
    ]);

    return result.insertId;
  }

  async getTotal(dto: GetAllConsignmentDto, userCode: string): Promise<number> {
    let whereSql = ` WHERE A.userCode = ? `;
    const params: any[] = [userCode];
    if (dto.consignmentStatus != 'ALL') {
      whereSql += ` AND A.consignmentStatus = ? `;
      params.push(dto.consignmentStatus);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT COUNT(A.seq) AS TOTAL 
      FROM ${this.table} A
       ${whereSql}`,
      params,
    );
    return rows.length ? (rows[0].TOTAL as number) : 0;
  }
  async getAll(dto: GetAllConsignmentDto, userCode: string): Promise<ConsignmentResDto[]> {
    let whereSql = ` WHERE A.userCode = ?  `;
    const params: any[] = [userCode];
    if (dto.consignmentStatus != 'ALL') {
      whereSql += ` AND A.consignmentStatus = ? `;
      params.push(dto.consignmentStatus);
    }

    whereSql += ` GROUP BY A.seq `;

    if (dto.limit != 0 && dto.page != 0) {
      whereSql += ` LIMIT ? OFFSET ? `;
      params.push(dto.limit);
      params.push((dto.page - 1) * dto.limit);
    }

    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT  A.seq, A.consignmentCode, A.userCode, A.senderName, A.senderPhone, A.nestType AS nestTypeCode, C.valueOption AS nestTypeLabel,
      A.nestQuantity, A.deliveryAddress,
      A.receiverName, A.receiverPhone, A.consignmentStatus,
       CASE 
        WHEN COUNT(B.seq) = 0 THEN JSON_ARRAY()
        ELSE JSON_ARRAYAGG(
          JSON_OBJECT(
            'seq', B.seq,
            'address', B.address,
            'createdAt', DATE_FORMAT(B.createdAt, '%Y-%m-%d %H:%i:%s')
          )
        )
      END AS deliveringAddressList,
          A.createdAt,
          A.updatedAt
        FROM ${this.table} A
        INNER JOIN ${this.tableOption} C
          ON A.nestType = C.code
        LEFT JOIN ${this.tableDelivering} B
          ON A.consignmentCode = B.consignmentCode
          AND B.isActive = 'Y'
        ${whereSql}
        `, params, );
    return rows as ConsignmentResDto[];
  }
}

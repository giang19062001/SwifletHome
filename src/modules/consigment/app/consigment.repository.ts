import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { generateCode } from 'src/helpers/func.helper';
import { RequestConsigmentDto } from './consigment.dto';
import { CODES } from 'src/helpers/const.helper';
import { ConsignmentStatusEnum } from './consigment.interface';

@Injectable()
export class ConsignmentAppRepository {
  private readonly table = 'tbl_consignment';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async requestConsigment(userCode: string, dto: RequestConsigmentDto): Promise<number> {
    const sqlLast = ` SELECT consignmentCode FROM ${this.table} ORDER BY consignmentCode DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let consignmentCode = CODES.consignmentCode.FRIST_CODE;
    if (rows.length > 0) {
      consignmentCode = generateCode(rows[0].consignmentCode, CODES.consignmentCode.PRE, 6);
    }

    const sql = `
       INSERT INTO ${this.table}  (userCode, consignmentCode, senderName, senderPhone, nestQuantity, deliveryAddress, receiverName,
        receiverPhone, consignmentStatus, createdId) 
       VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      userCode,
      consignmentCode,
      dto.senderName,
      dto.senderPhone,
      dto.nestQuantity,
      dto.deliveryAddress,
      dto.receiverName,
      dto.receiverPhone,
      ConsignmentStatusEnum.WAITING,
      userCode,
    ]);

    return result.insertId;
  }
}

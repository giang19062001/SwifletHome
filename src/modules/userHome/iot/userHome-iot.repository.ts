import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';

@Injectable()
export class UserHomeIotRepository {
  private readonly tableSensor = 'tbl_user_home_sensor';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getSensorConfigByMachineCode(machineCode: string): Promise<{ machineCode: string; macId: string; userHomeCode: string; userCode: string } | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT machineCode, macId, userHomeCode, userCode
        FROM ${this.tableSensor}
        WHERE machineCode = ? AND isActive = 'Y'
        LIMIT 1 `,
      [machineCode],
    );
    return rows.length ? (rows[0] as any) : null;
  }

  async getSensorByHomeCode(userHomeCode: string): Promise<{ machineCode: string; macId: string; userHomeCode: string; userCode: string } | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT machineCode, macId, userHomeCode, userCode
        FROM ${this.tableSensor}
        WHERE userHomeCode = ? AND isActive = 'Y'
        LIMIT 1 `,
      [userHomeCode],
    );
    return rows.length ? (rows[0] as any) : null;
  }
}

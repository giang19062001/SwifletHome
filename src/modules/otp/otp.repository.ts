import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IOtp } from './otp.interface';

@Injectable()
export class OtpRepository {
  private readonly table = 'tbl_otp';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async createOtp(userPhone: string, otpCode: string, expiresAt: Date, purpose: string): Promise<void> {
    const sql = `
      INSERT INTO ${this.table} (userPhone, otpCode, expiresAt, purpose)
      VALUES (?, ?, ?, ?)
    `;

    await this.db.query(sql, [userPhone, otpCode, expiresAt, purpose]);
  }

  async checkPhoneVarified(userPhone: string, purpose: string): Promise<IOtp | null> {
    const sql = `
      SELECT * FROM ${this.table} 
      WHERE userPhone = ? 
        AND purpose = ?
        AND isUsed = TRUE
      ORDER BY createdAt DESC 
      LIMIT 1
    `;

    const [rows] = await this.db.query<RowDataPacket[]>(sql, [userPhone, purpose]);
    return rows ? (rows[0] as IOtp) : null;
  }

  async findValidOtp(userPhone: string, purpose: string): Promise<IOtp | null> {
    const sql = `
      SELECT * FROM ${this.table} 
      WHERE userPhone = ? 
        AND purpose = ?
        AND expiresAt > NOW() 
        AND isUsed = FALSE
      ORDER BY createdAt DESC 
      LIMIT 1
    `;

    const [rows] = await this.db.query<RowDataPacket[]>(sql, [userPhone, purpose]);
    return rows ? (rows[0] as IOtp) : null;
  }

  async updateOtpAttempt(otpId: number, attemptCount: number): Promise<void> {
    const sql = `
      UPDATE ${this.table} 
      SET attemptCount = ? 
      WHERE seq = ?
    `;

    await this.db.query(sql, [attemptCount, otpId]);
  }

  async updateOtpAsUsed(otpId: number): Promise<void> {
    const sql = `
      UPDATE ${this.table} 
      SET isUsed = TRUE 
      WHERE seq = ?
    `;

    await this.db.query(sql, [otpId]);
  }
  async deleteOtp(userPhone: string, purpose: string): Promise<void> {
    const sql = `
      DELETE FROM ${this.table} 
      WHERE userPhone = ? AND purpose = ?
    `;

    await this.db.query(sql, [userPhone, purpose]);
  }

  
  async cleanupExpiredOtps(): Promise<void> {
    const sql = `
      DELETE FROM ${this.table} 
      WHERE expiresAt < NOW() 
         OR (attemptCount >= maxAttempts AND isUsed = FALSE)
    `;

    await this.db.query(sql);
  }

}

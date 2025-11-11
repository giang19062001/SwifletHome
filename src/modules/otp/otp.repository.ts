import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IOtp } from './otp.interface';

@Injectable()
export class OtpRepository {
  private readonly table = 'tbl_otp';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async createOtp(otpData: { phoneNumber: string; otpCode: string; expiresAt: Date }): Promise<void> {
    const sql = `
      INSERT INTO ${this.table} (phoneNumber, otpCode, expiresAt)
      VALUES (?, ?, ?)
    `;

    await this.db.query(sql, [otpData.phoneNumber, otpData.otpCode, otpData.expiresAt]);
  }

  async findValidOtp(phoneNumber: string): Promise<IOtp | null> {
    const sql = `
      SELECT * FROM ${this.table} 
      WHERE phoneNumber = ? 
        AND expiresAt > NOW() 
        AND isUsed = FALSE
      ORDER BY createdAt DESC 
      LIMIT 1
    `;

    const [rows] = await this.db.query<RowDataPacket[]>(sql, [phoneNumber]);
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

  async markOtpAsUsed(otpId: number): Promise<void> {
    const sql = `
      UPDATE ${this.table} 
      SET isUsed = TRUE 
      WHERE seq = ?
    `;

    await this.db.query(sql, [otpId]);
  }

  async deleteExpiredOtps(): Promise<void> {
    const sql = `
      DELETE FROM ${this.table} 
      WHERE expiresAt < NOW() 
         OR (attemptCount >= maxAttempts AND isUsed = FALSE)
    `;

    await this.db.query(sql);
  }

  async deleteOtpsByPhoneNumber(phoneNumber: string): Promise<void> {
    const sql = `
      DELETE FROM ${this.table} 
      WHERE phoneNumber = ?
    `;

    await this.db.query(sql, [phoneNumber]);
  }
}

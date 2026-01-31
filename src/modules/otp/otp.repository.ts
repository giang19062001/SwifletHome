import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IOtp } from './otp.interface';

@Injectable()
export class OtpRepository {
  private readonly table = 'tbl_otp';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async createOtp(userPhone: string, otpCode: string, expiresAt: Date, purpose: string, countryCode: string): Promise<void> {
    const sql = `
      INSERT INTO ${this.table} (userPhone, otpCode, expiresAt, purpose, countryCode)
      VALUES (?, ?, ?, ?, ?)
    `;

    await this.db.query(sql, [userPhone, otpCode, expiresAt, purpose, countryCode]);
  }

  async resetOtp(userPhone: string, otpCode: string, expiresAt: Date, purpose: string, countryCode: string): Promise<void> {
    const sql = `
      UPDATE ${this.table} SET purpose = ?, otpCode = ?, expiresAt = ?, createdAt = ?, attemptCount = 0, isUsed = FALSE 
      WHERE userPhone = ? AND countryCode = ?
    `;

    await this.db.query(sql, [purpose, otpCode, expiresAt, new Date(), userPhone, countryCode]);
  }

  async findOtpExist(userPhone: string, countryCode: string): Promise<IOtp | null> {
    const sql = `
      SELECT seq, userPhone, otpCode, purpose, attemptCount, maxAttempts, expiresAt, createdAt, isUsed  FROM ${this.table} 
      WHERE userPhone = ? AND  countryCode = ?
      LIMIT 1
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, [userPhone, countryCode]);
    return rows ? (rows[0] as IOtp) : null;
  }

  async findValidOtp(userPhone: string, purpose: string, countryCode: string): Promise<IOtp | null> {
    const sql = `
      SELECT seq, userPhone, otpCode, purpose, attemptCount, maxAttempts, expiresAt, createdAt, isUsed FROM ${this.table} 
      WHERE userPhone = ? 
        AND purpose = ?
        AND countryCode = ?
        AND expiresAt > NOW() 
        AND isUsed = FALSE
        AND otpCode != '0000'
      ORDER BY createdAt DESC 
      LIMIT 1
    `;

    const [rows] = await this.db.query<RowDataPacket[]>(sql, [userPhone, purpose, countryCode]);
    return rows ? (rows[0] as IOtp) : null;
  }

  async checkPhoneVarified(userPhone: string, purpose: string, countryCode: string): Promise<IOtp | null> {
    const sql = `
      SELECT seq, userPhone, otpCode, purpose, attemptCount, maxAttempts, expiresAt, createdAt, isUsed 
      FROM ${this.table} 
      WHERE userPhone = ? 
        AND purpose = ?
        AND countryCode = ?
        AND isUsed = TRUE
      ORDER BY createdAt DESC 
      LIMIT 1
    `;

    const [rows] = await this.db.query<RowDataPacket[]>(sql, [userPhone, purpose, countryCode]);
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

}

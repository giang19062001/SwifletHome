import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { CheckoutPayDto } from './checkout.dto';
import { UPDATOR } from 'src/helpers/const.helper';

@Injectable()
export class CheckoutAppRepository {
  private readonly tableCheckout = 'tbl_checkout';
  private readonly tablePackage = 'tbl_user_package';
  private readonly tablePackageHistory = 'tbl_user_package_history';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async saveCheckout(dto: CheckoutPayDto): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableCheckout} (
        app_id, app_user_id, country_code, currency, discount_amount, discount_identifier,
        discount_percentage, entitlement_ids, environment, event_timestamp_ms, expiration_at_ms,
        is_family_share, is_trial_conversion, offer_code, period_type, presented_offering_context,
        presented_offering_id, price, price_in_purchased_currency, product_display_name,
        product_id, purchased_at_ms, renewal_number, store, takehome_percentage, transaction_id
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `;
    
    const entitlementIdsStr = dto.entitlement_ids ? JSON.stringify(dto.entitlement_ids) : null;
    
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.app_id, dto.app_user_id, dto.country_code, dto.currency, dto.discount_amount, dto.discount_identifier,
      dto.discount_percentage, entitlementIdsStr, dto.environment, dto.event_timestamp_ms, dto.expiration_at_ms,
      dto.is_family_share, dto.is_trial_conversion, dto.offer_code, dto.period_type, dto.presented_offering_context,
      dto.presented_offering_id, dto.price, dto.price_in_purchased_currency, dto.product_display_name,
      dto.product_id, dto.purchased_at_ms, dto.renewal_number, dto.store, dto.takehome_percentage, dto.transaction_id
    ]);

    return result.insertId;
  }

  async writePackageHistory(packageCode: string, userCode: string, startDate: string | null, endDate: string | null, createdAt: Date, checkoutSeq: number | null): Promise<number> {
    const sql = `
        INSERT INTO ${this.tablePackageHistory} (userCode, packageCode, startDate, endDate, createdId, createdAt, checkout_seq) 
        VALUES(?, ?, ?, ?, ?, ?, ?)
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [userCode, packageCode, startDate, endDate, UPDATOR, createdAt, checkoutSeq]);

    return result.insertId;
  }

  async updatePackage(packageCode: string, userCode: string, startDate: string | null, endDate: string | null, updatedId: string, updatedAt: Date, checkoutSeq: number | null): Promise<number> {
    const sql = `
        UPDATE ${this.tablePackage} SET packageCode = ?, startDate = ?, endDate = ?, updatedId = ?, updatedAt = ?, checkout_seq = ?
        WHERE userCode = ?
      `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [packageCode, startDate, endDate, updatedId, updatedAt, checkoutSeq, userCode]);
    return result.affectedRows;
  }

  async getCurrentPackage(userCode: string): Promise<any | null> {
    const sql = `SELECT packageCode, startDate, endDate FROM ${this.tablePackage} WHERE userCode = ? LIMIT 1`;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, [userCode]);
    return rows.length ? rows[0] : null;
  }

  async getPackageByExpireDay(expireDay: number): Promise<any | null> {
    const sql = `SELECT packageCode, packageExpireDay FROM tbl_package WHERE isActive = 'Y' AND packageExpireDay = ? LIMIT 1`;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, [expireDay]);
    return rows.length ? rows[0] : null;
  }

  async existsByTransactionId(transactionId: string): Promise<boolean> {
    const sql = `SELECT seq FROM ${this.tableCheckout} WHERE transaction_id = ? LIMIT 1`;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, [transactionId]);
    return rows.length > 0;
  }
}

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
    const event = dto.event || ({} as any);

    const sql = `
      INSERT INTO ${this.tableCheckout} (
        api_version, app_id, app_user_id, country_code, currency, discount_amount, discount_identifier,
        discount_percentage, entitlement_ids, environment, event_timestamp_ms, expiration_at_ms,
        is_family_share, is_trial_conversion, offer_code, period_type, presented_offering_context,
        presented_offering_id, price, price_in_purchased_currency, product_display_name,
        product_id, purchased_at_ms, renewal_number, store, takehome_percentage, transaction_id
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `;
    
    const entitlementIdsStr = event.entitlement_ids ? JSON.stringify(event.entitlement_ids) : null;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [
      dto.api_version ?? null,
      event.app_id ?? null,
      event.app_user_id ?? null,
      event.country_code ?? null,
      event.currency ?? null,
      event.discount_amount ?? null,
      event.discount_identifier ?? null,
      event.discount_percentage ?? null,
      entitlementIdsStr,
      event.environment ?? null,
      event.event_timestamp_ms ?? null,
      event.expiration_at_ms ?? null,
      event.is_family_share ?? null,
      event.is_trial_conversion ?? null,
      event.offer_code ?? null,
      event.period_type ?? null,
      event.presented_offering_context ?? null,
      event.presented_offering_id ?? null,
      event.price ?? null,
      event.price_in_purchased_currency ?? null,
      event.product_display_name ?? null,
      event.product_id ?? null,
      event.purchased_at_ms ?? null,
      event.renewal_number ?? null,
      event.store ?? null,
      event.takehome_percentage ?? null,
      event.transaction_id ?? null,
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

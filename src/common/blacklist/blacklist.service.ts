import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BlacklistService implements OnModuleInit {
  private readonly logger = new Logger(BlacklistService.name);
  private blacklistedIps: Set<string> = new Set();

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: any) {}

  async onModuleInit() {
    await this.loadBlacklist();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async loadBlacklist() {
    try {
      const [rows] = await this.db.query("SELECT ipAddress FROM tbl_blacklist_ip WHERE isActive = 'Y'");
      const newSet = new Set<string>();
      for (const row of rows) {
        newSet.add(row.ipAddress);
      }
      this.blacklistedIps = newSet;
    } catch (e) {
      this.logger.error('Error loading IP blacklist', e);
    }
  }

  isBlacklisted(ip: string): boolean {
    return this.blacklistedIps.has(ip);
  }
}

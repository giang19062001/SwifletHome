// src/services/logging.service.ts
import { Injectable, LoggerService, LogLevel, Scope } from '@nestjs/common';
import { winstonConfig } from 'src/config/logger';
import { requestContextStorage } from 'src/middleware/ip';
import { createLogger, Logger } from 'winston';

@Injectable({ scope: Scope.DEFAULT }) // ✅ Chuyển sang DEFAULT scope
export class LoggingService implements LoggerService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger(winstonConfig);
  }

  private getLogMetadata(context?: any) {
    const requestContext = requestContextStorage.getStore();

    return {
      context,
      ip: requestContext?.ip || 'system', // 'system' cho cron jobs
      requestId: requestContext?.requestId,
      userId: requestContext?.userId,
      path: requestContext?.path,
      method: requestContext?.method,
    };
  }

  log(message: string, context?: any) {
    this.logger.info(message, this.getLogMetadata(context));
  }

  error(message: string, context?: any) {
    this.logger.error(message, this.getLogMetadata(context));
  }

  warn(message: string, context?: any) {
    this.logger.warn(message, this.getLogMetadata(context));
  }

  debug(message: string, context?: any) {
    this.logger.debug(message, this.getLogMetadata(context));
  }

  verbose(message: string, context?: any) {
    this.logger.verbose(message, this.getLogMetadata(context));
  }

  fatal(message: string, context?: any) {
    // Winston không có 'fatal', dùng error với severity cao
    this.logger.error(`[FATAL] ${message}`, {
      ...this.getLogMetadata(context),
      severity: 'fatal',
    });
  }

  setLogLevels(levels: LogLevel[]) {
    // Winston config thường set levels khi khởi tạo
    // Nếu cần dynamic, có thể implement thêm
    this.logger.level = levels[0] || 'info';
  }
}

import { Injectable, LoggerService, LogLevel, Scope } from '@nestjs/common';
import { getWinstonConfig } from 'src/common/logger/logger.config';
import { requestContextStorage } from 'src/middleware/ip.middleware';
import { createLogger, Logger } from 'winston';

@Injectable({ scope: Scope.DEFAULT }) //  Chuyển sang DEFAULT scope
export class LoggingService implements LoggerService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger(getWinstonConfig());
  }


  private getLogMetadata(context?: any) {
    const requestContext = requestContextStorage.getStore();
    const redactedContext = this.redact(context);

    // Tự động stringify TOÀN BỘ context nếu nó là object để Loki dễ bắt
    const logContext = (redactedContext && typeof redactedContext === 'object')
      ? JSON.stringify(redactedContext)
      : redactedContext;

    return {
      context: logContext,
      ip: requestContext?.ip,
      requestId: requestContext?.requestId,
      userId: requestContext?.userId,
      url: requestContext?.url,
      method: requestContext?.method,
    };
  }

  // bảo mật log
  private redact(obj: any, seen = new WeakSet()): any {
    if (!obj) return obj;

    // Xử lý Error object (vì for..in không quét được message/stack)
    if (obj instanceof Error) {
      return this.redact({
        message: obj.message,
        stack: obj.stack,
        ...(obj as any),
      }, seen);
    }

    if (typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj;
    if (Buffer.isBuffer(obj)) return '[Buffer]';
    if (seen.has(obj)) return '[Circular]';

    seen.add(obj);
    const sensitiveFields = ['password', 'token', 'refreshToken', 'secret', 'jwt', 'cookie'];
    const redacted = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        // biến các trường nhạy cảm thành *** - bảo vệ quyền riêng tư
        if (sensitiveFields.includes(key.toLowerCase())) {
          (redacted as any)[key] = '***';
        } else if (typeof val === 'object' && val !== null) {
          (redacted as any)[key] = this.redact(val, seen);
        } else {
          (redacted as any)[key] = val;
        }
      }
    }
    return redacted;
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
    this.logger.error(`[FATAL] ${message}`, {
      ...this.getLogMetadata(context),
      severity: 'fatal',
    });
  }

  setLogLevels(levels: LogLevel[]) {
    this.logger.level = levels[0] || 'info';
  }
}
